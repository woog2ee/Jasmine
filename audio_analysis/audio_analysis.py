#!/usr/bin/env python
# coding: utf-8

# In[8]:


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
import base64
import wave
import math

import librosa
import soundfile as sf
import sounddevice as sd
from pydub import AudioSegment
from slient_analysis import SlientAnalyzer
from pymongo import MongoClient
import certifi


# In[9]:


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
        return result
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


# In[10]:


def visualize_result(value, title):
    num_value = np.arange(1, len(value)+1, 1)
    
    plt.xlabel('시간')
    plt.ylabel(title)
    plt.plot(num_value, value, marker='o', color='#a30fe2')
    plt.plot(num_value, value, color='#f99dff')
    plt.xticks([])
    plt.yticks([])
    plt.show()


# In[11]:


def encode_image_tobase64(imagepath):
    with open(imagepath, 'rb') as img_file:
        base64_string = base64.b64encode(img_file.read())
    return base64_string

def make_comment():
    
    return volume_comment, speed_comment, pronunciation_comment


# In[12]:


def upload_comment(volume_comment, volume_image,
                   speed_comment, speed_image,
                   pronunciation_comment, pronunciation_image):
    host = 'mongodb+srv://seungukyu:0128@jasmine.iyjg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    client = MongoClient(host, tlsCAFile=certifi.where())
    database = client['myFirstDatabase']
    collection = database['audio_result']

    audio_analysis = {
        'volume_comment': volume_comment,
        'volume_image': volume_image,
        'speed_comment': speed_comment,
        'speed_image': speed_image,
        'pronunciation_comment': pronunciation_comment,
        'pronunciation_image': pronunciation_image
    }
    collection.insert(audio_analysis)


# In[14]:


if __name__ == '__main__':
    audiofile = 'heykakao.wav'
    
    SA = SlientAnalyzer(audiofile)     # 묵음 분석 클래스
    speak_time, quiet_time = SA.slient_analyze(audiofile)
    
    AA = AudioAnalyzer(audiofile)        # 오디오 분석 클래스
    AA.trim_audiofile(audiofile, 30)     # 30초 단위로 오디오 분리
    
    tempo       = []
    mean_volume = []
    max_volume  = []
    for i in range(AA.cnt):
        cur_audiofile = f'./trimdata/{AA.filename}_{i}.wav'
        cur_tempo = AA.detect_audio_bpm(cur_audiofile)
        cur_mean_volume, cur_max_volume = AA.detect_audio_decibel(cur_audiofile)
        tempo.append(cur_tempo)
        mean_volume.append(cur_mean_volume)
        max_volume.append(cur_max_volume)


# In[ ]:





# In[15]:


print(speak_time, quiet_time)


# In[16]:


tempo


# In[17]:


mean_volume


# In[18]:


max_volume


# In[19]:


visualize_result(mean_volume, '최소 볼륨')


# In[ ]:




