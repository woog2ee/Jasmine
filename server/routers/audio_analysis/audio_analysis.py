import re
import os
import time
import wave
import math
import json
import base64 
import urllib3
import subprocess
import pandas as pd

import warnings
warnings.filterwarnings(action='ignore')

import librosa
import soundfile as sf
from slient_analysis import SlientAnalyzer
from make_audiofile import AudioMaker
from make_audiofile import CommentMaker



class AudioAnalyzer:
    def __init__(self, audiofile):
        y, sr = librosa.load(audiofile, sr=16000)
        self.y = y
        self.sr = sr
        self.cnt = None     # 전체 음성파일을 n초로 나눴을 때 파일 개수
        self.duration = self.get_duration(audiofile)
        self.etri_url = "http://aiopen.etri.re.kr:8000/WiseASR/PronunciationKor"
        self.etri_accesskey = "ac22297c-3aa5-45ba-bb35-1b88fd31f124"
        
        
        
    # 음성파일 n초 단위로 분리
    def trim_audiofile(self, audiofile, n):
        # 파일 정보
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
            speechaudio_path = '\\server\\routers\\audio_analysis\\audiofiles'
            sf.write(os.getcwd()+speechaudio_path+f'\\Jasmine_음성파일_{i}.wav', ny, sr, 'PCM_24')
    
    
        
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



# 발음평가용 stt 텍스트 리턴
def get_stt_texts(createdAt):
    stt_collection = AudioMaker().mongodb_connection('speechtexts')
    docs = stt_collection.find({'createdAt': createdAt})
    for doc in docs:
        stt_texts = doc['text']
    return stt_texts



if __name__ == '__main__':
    # 오디오 파일 및 유저 정보 로드
    audiofile = 'C:/Users/USER/Downloads/Jasmine_음성파일.wav'
    userFrom, createdAt = AudioMaker().get_wav_audio()     
    
    SA = SlientAnalyzer(audiofile)           # 묵음 분석 클래스
    AA = AudioAnalyzer(audiofile)            # 오디오 분석 클래스
    AA.trim_audiofile(audiofile, 5)          # 5초 단위로 오디오 분리
    stt_texts = get_stt_texts(createdAt)     # 5초 단위 발표 텍스트
    
    speak_time, quiet_time = SA.slient_analyze(audiofile)     # 발화 시작 및 끝 구간
    tempo       = []                                          # 발표 구간의 속도
    mean_volume = []                                          # 발표 구간의 최소 볼륨
    max_volume  = []                                          # 발표 구간의 최대 볼륨
    pronunc_score = []                                        # 발음평가 점수

    # 5초 단위로 분리한 오디오로 분석
    for i in range(AA.cnt):
        speechaudio_path = '\\server\\routers\\audio_analysis\\audiofiles'
        cur_audiofile = os.getcwd()+speechaudio_path+f'\\Jasmine_음성파일_{i}.wav'
        cur_duration = AA.get_duration(cur_audiofile)
        if cur_duration <= 2:
            continue

        cur_tempo = AA.detect_audio_bpm(cur_audiofile)
        cur_mean_volume, cur_max_volume = AA.detect_audio_decibel(cur_audiofile)
        cur_pronunc_score = AA.get_pronunciation_score(cur_audiofile, stt_texts[i])

        tempo.append(cur_tempo)
        mean_volume.append(cur_mean_volume)
        max_volume.append(cur_max_volume)
        pronunc_score.append(cur_pronunc_score)

    # 분석 자료 만들고 MongoDB에 업로드
    CM = CommentMaker(userFrom, createdAt)
    CM.create_speech_document(speak_time, quiet_time, tempo, mean_volume, max_volume, pronunc_score)
    CM.upload_speech_document()

    # 분석한 오디오 파일 지우기
    os.remove(audiofile)