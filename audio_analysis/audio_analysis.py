import re 
import numpy as np
import pandas as pd
import subprocess
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'NanumGothic'
import warnings
warnings.filterwarnings(action='ignore')

import os
import urllib3
import json
import wave
import math

import librosa
import soundfile as sf
import sounddevice as sd
from pydub import AudioSegment
from slient_analysis import SlientAnalyzer
from pymongo import MongoClient
import getpass
import certifi
import base64



class AudioAnalyzer:
    def __init__(self, audiofile):
        y, sr = librosa.load(audiofile)
        self.y = y
        self.sr = sr
        self.filename = re.sub('.wav', '', audiofile)
        self.cnt = None     # 전체 음성파일을 n초로 나눴을 때 파일 개수
        self.duration = self.get_duration(audiofile)
        self.etri_url = "http://aiopen.etri.re.kr:8000/WiseASR/PronunciationKor"
        self.etri_accesskey = "ac22297c-3aa5-45ba-bb35-1b88fd31f124"
        
        
        
    # 음성파일 n초 단위로 분리
    def trim_audiofile(self, audiofile, n):
        # 파일 정보
        filename = self.filename
        y = self.y
        sr = self.sr
        
        # n에 따른 오디오 개수
        time = self.duration
        sec = n
        if time % sec == 0:
            self.cnt = time // sec
        else:
            self.cnt = time // sec + 1
            
        # n초 단위로 잘라서 저장
        for i in range(self.cnt):
            ny = y[sr*sec*i:sr*sec*(i+1)]
            sf.write(f'./trimdata/{filename}_{i}.wav', ny, sr, 'PCM_24')
    
    
        
    # 음성파일 속도 추출
    def detect_audio_bpm(self, audiofile):
        tempo, beats = librosa.beat.beat_track(y=self.y, sr=self.sr)
        return tempo
        
        
        
    # 커맨드 결과를 리턴    
    def cmdline(self, command):
        process = subprocess.Popen(
            args=command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            shell=True,
            encoding='utf-8'
        )
        return process.communicate()[0]
    
    
    
    # 커맨드로 데시벨 정보 추출
    def detect_audio_decibel(self, audiofile):
        # cmd 명령어로 데시벨 정보 추출
        command = f'ffmpeg -i {audiofile} -filter volumedetect -f null -'
        decibel_text = self.cmdline(command)

        # 텍스트 전처리
        matchs0 = re.finditer(r'\[Parsed_volumedetect', decibel_text)
        for match in matchs0:
            detect_index = match.span()[0]
            break

        decibel_text = decibel_text[detect_index:]
        decibel_text = re.sub(r'\[[^]]*\]', '', decibel_text)
        decibel_text = re.sub(r'\n', '', decibel_text)
        decibel_text = re.sub(r'dB', '', decibel_text)

        # 데시벨 정보 추출
        matchs0 = re.finditer(r':', decibel_text)
        cnt = 0
        for match in matchs0:
            cnt += 1

        list_name = []
        list_value = []
        while cnt > 0:
            matchs1 = re.finditer(r':', decibel_text)
            for match in matchs1:
                comma_index = match.span()[0]
                break
            cur_list_name = decibel_text[:comma_index+1]
            list_name.append(cur_list_name)

            for i in range(comma_index, len(decibel_text), 1):
                if (decibel_text[i] == ' ') and (i != comma_index+1):
                    blank_index = i
                    break
            cur_list_value = decibel_text[comma_index+1:blank_index+1]
            list_value.append(cur_list_value)

            decibel_text = decibel_text.replace(cur_list_name, '')
            decibel_text = decibel_text.replace(cur_list_value, '')
            cnt -= 1

        # 최종 텍스트 전처리
        for i in range(len(list_name)):
            list_name[i] = re.sub(r':', '', list_name[i])
            list_name[i] = re.sub(r' ', '', list_name[i])
            list_value[i] = re.sub(r' ', '', list_value[i])

        # 데시벨 정보와 평균 볼륨값을 리턴
        decibel_info = pd.DataFrame({'정보': list_name, '값': list_value})
        mean_volume = decibel_info.iloc[1, 1]
        max_volume = decibel_info.iloc[2, 1]
        return mean_volume, max_volume
    
    
    
    # 오디오 발음평가 score 측정
    def get_pronunciation_score(self, audiofile, script):
        openApiURL = self.etri_url 
        accessKey = self.etri_accesskey
        languageCode = "korean"

        file = open(audiofile, "rb")
        audioContents = base64.b64encode(file.read()).decode("utf8")
        file.close()

        requestJson = {
            "access_key": accessKey,
            "argument": {
                "language_code": languageCode,
                "script": script,
                "audio": audioContents
            }
        }

        http = urllib3.PoolManager()
        response = http.request(
            "POST",
            openApiURL,
            headers={"Content-Type": "application/json; charset=UTF-8"},
            body=json.dumps(requestJson)
        )

        # 발음평가 score 추출
        result = str(response.data, "utf-8")
        matchs = re.finditer(r'score', result)
        for match in matchs:
            score_idx = match.span()[1]
        score = result[score_idx:]

        score = re.sub(r'\'', '', score)
        score = re.sub(r'\"', '', score)
        score = re.sub(r':', '', score)
        score = re.sub(r'}', '', score)
        score = float(score)
        return score
    
    
    
    # wav 파일 재생시간 반환
    def get_duration(self, audiofile):
        audio = wave.open(audiofile)
        frames = audio.getnframes()
        rate = audio.getframerate()
        duration = frames / float(rate)
        return math.ceil(duration)



def visualize_result(value, xtitle, ytitle, yrange):
    num_value = np.arange(1, len(value)+1, 1)
    plt.xlabel(xtitle, fontsize=14)
    plt.ylabel(ytitle, fontsize=14)

    plt.plot(num_value, value, marker='o', color='#a30fe2')
    plt.plot(num_value, value, color='#f99dff')
    plt.ylim([min(value)-yrange, max(value)+yrange])
    plt.xticks([])
    plt.yticks([])
    plt.savefig(f'./Jasmine_audio_{xtitle}_{ytitle}.png')
    audio_img = encode_image_tobase64(f'./Jasmine_audio_{xtitle}_{ytitle}.png')
    return audio_img



def encode_image_tobase64(imagepath):
    with open(imagepath, 'rb') as img_file:
        base64_string = base64.b64encode(img_file.read())
    return base64_string

def make_comment(speak_time, quiet_time, tempo, mean_volume, max_volume):
    # 묵음 구간 판단
    speak_time, quiet_time = set_slient(speak_time, quiet_time)
    toomuch_speak = check_slient(speak_time, 6)
    toomuch_quiet = check_slient(quiet_time, 3)
    slient_comment = f'아이의 발표에서 발화 구간과 묵음 구간에 따른 시간을 보여주는 자료입니다. '
    
    if (toomuch_speak > 0) and (toomuch_quiet > 0):
        slient_comment += '특히 아이가 발표에서 말을 오래 끌거나, 말을 오랫동안 하지 않는 경우가 종종 발견됩니다. '
        slient_comment += '아이가 발표에 더욱 집중하여 말을 할 수 있도록 점검해주세요.'
    elif toomuch_speak > 0:
        slient_comment += '특히 아이가 발표에서 말을 오래 끄는 경우가 종종 발견됩니다. '
        slient_comment += '발표 중 적절한 타이밍에 말을 끊을 수 있도록 격려해주세요.'
    elif toomuch_quiet > 0:
        slient_comment += '특히 아이가 발표에서 말을 오랫동안 하지 않는 경우가 종종 발견됩니다. '
        slient_comment += '발표 중 불필요한 공백을 가지지 않고 말하도록 격려해주세요.'
    else:
        slient_comment += '아이가 발표할 때 말을 오래 끌거나, 말을 오랫동안 하지 않는 경우 없이 적절하게 발표해 주었습니다.'
    speaktime_image = visualize_result(speak_time, '발화 구간', '시간', 25)
    quiettime_image = visualize_result(quiet_time, '묵음 구간', '시간', 10)

    # 목소리 속도 판단
    slow_tempo, fast_tempo = check_area(tempo, False)
    tempo_comment = f'아이의 발표에서 목소리 속도를 나타낸 그래프입니다. '

    if (slow_tempo == True) and (fast_tempo == True):
        tempo_comment += '특히 아이가 발표에서 목소리 속도를 일관되게 유지하지 못하며 평소보다 더 빠르거나 느린 목소리로 말한 경향이 보여집니다. '
        tempo_comment += '발표 중 목소리 속도를 일관되게 유지할 수 있도록 점검해주세요.'
    elif slow_tempo == True:
        tempo_comment += '특히 아이가 발표에서 목소리 속도를 평균보다 느리게 말하는 경향이 보여집니다. '
        tempo_comment += '발표 중 여유를 가지며 적절한 속도로 발표할 수 있도록 격려해주세요.'
    elif fast_tempo == True:
        tempo_comment += '특히 아이가 발표에서 목소리 속도를 평균보다 빠르게 말하는 경향이 보여집니다. '
        tempo_comment += '발표 중 떨지 않고 안정된 상태로 발표할 수 있도록 격려해주세요.'
    else:
        tempo_comment += '아이가 발표할 때 너무 빠르거나 느리게 말하지 않고 적절한 목소리 속도로 잘 발표해 주었습니다.'
    tempo_image = visualize_result(tempo, '시간', '목소리 속도', 25)

    # 목소리 크기 판단
    avg_volume = [0] * len(mean_volume)
    for i in range(len(mean_volume)):
        avg_volume[i] = float(mean_volume[i]) + float(max_volume[i])
    small_volume, big_volume = check_area(avg_volume, True)
    volume_comment = f'아이의 발표에서 목소리 크기를 나타낸 그래프입니다. '

    if (small_volume == True) and (big_volume == True):
        volume_comment += '특히 아이가 발표에서 목소리 크기를 일정하게 유지하지 못하며 평소보다 더 크거나 작은 목소리로 말한 경향이 보여집니다. '
        volume_comment += '발표 중 목소리 크기를 일관되게 말할 수 있도록 점검해주세요.'
    elif small_volume == True:
        volume_comment += '특히 아이가 발표에서 목소리 크기를 평균보다 작게 말하는 경향이 보여집니다. '
        volume_comment += '발표 중 주눅들지 않고 자신감을 가지며 발표할 수 있도록 격려해주세요.'
    elif big_volume == True:
        volume_comment += '특히 아이가 발표에서 목소리 크기를 평균보다 크게 말하는 경향이 보여집니다. '
        volume_comment += '발표 중 너무 들뜨지 않고 차분하게 발표할 수 있도록 격려해주세요.'
    else:
        volume_comment += '아이가 발표할 때 너무 크거나 작게 말하지 않고 적절한 목소리 크기로 잘 발표해 주었습니다.' 
    volume_image = visualize_result(avg_volume, '시간', '목소리 크기', 25)
    return slient_comment, speaktime_image, quiettime_image, tempo_comment, tempo_image, volume_comment, volume_image

def set_slient(speak_time, quiet_time):
    new_speak_time = []
    new_quiet_time = []
    temp = 0
    for i in range(len(speak_time)):
        if i == len(speak_time)-1:
            new_speak_time.append(speak_time[i])
            break
            
        if quiet_time[i] <= 0.5:
            temp += speak_time[i]
        else:
            temp += speak_time[i]
            new_speak_time.append(temp)
            new_quiet_time.append(quiet_time[i])
            temp = 0
    return new_speak_time, new_quiet_time

def check_slient(time, value):
    cnt = 0
    for i in range(len(time)):
        if time[i] > value:
            cnt += 1
    return cnt

def check_area(range, minus=False):
    avg   = sum(range) // len(range)
    flag1 = False
    flag2 = False
    ratio = 0.2

    if minus == True:
        for i in range(len(range)):
            if range[i] <= avg*(1+ratio):
                flag1 = True
            elif avg*(1-ratio) <= range[i]:
                flag2 = True
    else:
        for i in range(len(range)):
            if range[i] <= avg*(1-ratio):
                flag1 = True
            elif avg*(1+ratio) <= range[i]:
                flag2 = True
    return flag1, flag2



def upload_speech_document(slient_comment, speaktime_image, quiettime_image,
                           tempo_comment, tempo_image, volume_comment, volume_image):
    host = 'mongodb+srv://seungukyu:0128@jasmine.iyjg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    client = MongoClient(host, tlsCAFile=certifi.where())
    database = client['myFirstDatabase']
    collection = database['audio_result']

    # comment는 아이의 발표 결과에 따라 선정되며,
    # iamage는 발표 분석 통계 자료를 base64로 인코딩함
    audio_analysis = {
        'user'           : getpass.getuser(),
        'slient_comment' : slient_comment,
        'speaktime_image': speaktime_image,
        'quiettime_image': quiettime_image,
        'tempo_comment'  : tempo_comment,
        'tempo_image'    : tempo_image,
        'volume_comment' : volume_comment,
        'volume_image'   : volume_image
    }
    collection.insert(audio_analysis)



if __name__ == '__main__':
    audiofile = 'heykakao.wav'
    
    SA = SlientAnalyzer(audiofile)     # 묵음 분석 클래스
    speak_time, quiet_time = SA.slient_analyze(audiofile)
    
    AA = AudioAnalyzer(audiofile)        # 오디오 분석 클래스
    AA.trim_audiofile(audiofile, 30)     # 30초 단위로 오디오 분리
    
    tempo       = []     # 발표 구간의 속도
    mean_volume = []     # 발표 구간의 최소 볼륨
    max_volume  = []     # 발표 구간의 최대 볼륨

    # 30초 단위로 분리한 오디오로 분석
    for i in range(AA.cnt):
        cur_audiofile = f'./trimdata/{AA.filename}_{i}.wav'
        cur_duration = AA.get_duration(cur_audiofile)
        if cur_duration <= 10:
            continue

        cur_tempo = AA.detect_audio_bpm(cur_audiofile)
        cur_mean_volume, cur_max_volume = AA.detect_audio_decibel(cur_audiofile)
        tempo.append(cur_tempo)
        mean_volume.append(cur_mean_volume)
        max_volume.append(cur_max_volume)

    # 학부모 인터페이스용 코멘트 및 분석 자료 생성
    slient_comment, speaktime_image, quiettime_image, tempo_comment, tempo_image, volume_comment, volume_image =\
        make_comment(speak_time, quiet_time, tempo, mean_volume, max_volume)

    # DB에 학부모 인터페이스용 코멘트 및 분석 자료 등록
    upload_speech_document(slient_comment, speaktime_image, quiettime_image,\
                           tempo_comment, tempo_image,\
                           volume_comment, volume_image)