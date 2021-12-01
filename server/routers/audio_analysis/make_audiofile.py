import os
import time
import base64
import urllib
import numpy as np

import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'NanumGothic'

import warnings
warnings.filterwarnings(action='ignore')

from selenium import webdriver
from bs4 import BeautifulSoup
from pymongo import MongoClient
import certifi
img_save_path = os.getcwd()+'\\client\\public'



class AudioMaker():
    def __init__(self):
        self.host = 'mongodb+srv://sangh:0000@jasmine.iqad5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    
    
    
    # 연결할 MongoDB의 collection 리턴
    def mongodb_connection(self, collection_name):
        client     = MongoClient(self.host, tlsCAFile=certifi.where())
        database   = client['myFirstDatabase']
        collection = database[collection_name]
        return collection



    # 해당 collection에서 발표 정보 리턴
    def mongodb_userinfo(self, docs):
        userFrom_all  = []
        createdAt_all = []
        for doc in docs:
            try:
                userFrom  = doc['userFrom']
                createdAt = doc['createdAt']
                userFrom_all.append(userFrom)
                createdAt_all.append(createdAt)
            except:
                pass
        return userFrom_all, createdAt_all



    # 오디오 url로 wav 파일 변환
    def get_wav_audio(self):
        # DB에 audio가 올려진 발표 정보
        audio_collection = self.mongodb_connection('audios')
        audio_docs = list(audio_collection.find())
        audio_userFrom, audio_createdAt = self.mongodb_userinfo(audio_docs)

        # DB에 목소리 분석이 올려진 발표 정보
        voice_collection = self.mongodb_connection('voices')
        voice_docs = list(voice_collection.find())
        voice_userFrom, voice_createdAt = self.mongodb_userinfo(voice_docs)

        # 'audio는 있으나 목소리 분석이 안올려진 발표'라면 해당 정보를 리턴
        complement_userFrom  = list(set(audio_userFrom) - set(voice_userFrom))
        complement_createdAt = list(set(audio_createdAt) - set(voice_createdAt))
        upload_userFrom  = complement_userFrom[0]
        upload_createdAt = complement_createdAt[0]

        # 오디오 파일 크롤링
        #upload_docs = audio_collection.find({'userFrom' : upload_userFrom,
        #                                     'createdAt': upload_createdAt})
        #for doc in upload_docs:
        #    audio_url = doc['audioUrl']

        # self.crawl_audio_url(audio_url)
        # self.convert_mp4_to_wav()
        #return 'Jasmine_speech_audio.wav', upload_userFrom, upload_createdAt
        return upload_userFrom, upload_createdAt



    # Data url로 오디오 파일 크롤링
    def crawl_audio_url(self, url):
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        driver = webdriver.Chrome('C:/Users/USER/chromedriver.exe', options=options)
        driver.get(url)
        time.sleep(1)    

        html = driver.page_source
        soup = BeautifulSoup(html,'html.parser')
        audio_url = soup.find(type='audio/wav').get('src') 
        urllib.request.urlretrieve(audio_url, 'Jasmine_음성파일.mp4')
        driver.close()



    # 오디오 파일 확장자 변환
    def convert_mp4_to_wav(self):
        try:
            os.remove('Jasmine_speech_audio.wav')
        except:
            pass
        os.system('ffmpeg -i Jasmine_음성파일.mp4 -acodec pcm_s16le -ar 16000 Jasmine_음성파일.wav')



class CommentMaker():
    def __init__(self, userFrom, createdAt):
        self.userFrom  = userFrom
        self.createdAt = createdAt
        
        self.score         = 100
        self.slient_cmt    = None
        self.tempo_cmt     = None
        self.volume_cmt    = None
  
        self.slient_cmt_c  = None
        self.tempo_cmt_c   = None
        self.volume_cmt_c  = None
        
        self.toomuch_speak = None
        self.toomuch_quiet = None
        self.slow_tempo    = None
        self.fast_tempo    = None
        self.small_volume  = None
        self.big_volume    = None
        
        
        
    # 발표 점수(목소리) 측정
    def make_score(self):
        if self.toomuch_speak >= 6:
            self.score -= 6
        elif self.toomuch_speak >= 3:
            self.score -= 3
        if self.toomuch_quiet >= 6:
            self.score -= 6
        elif self.toomuch_quiet >= 3:
            self.score -= 3
            
        if self.slow_tempo:
            self.score -= 4
        if self.fast_tempo:
            self.score -= 4
        if self.small_volume:
            self.score -= 4
        if self.big_volume:
            self.score -=4
            
    
    
    # 학부모 인터페이스용 코멘트 생성
    def make_parent_comment(self, speak_time, quiet_time, tempo, mean_volume, max_volume):
        # 묵음 구간 판단
        speak_time, quiet_time = self.set_slient(speak_time, quiet_time)
        self.toomuch_speak = self.check_slient(speak_time, 6)
        self.toomuch_quiet = self.check_slient(quiet_time, 3)
        self.slient_cmt = f'아이의 발표에서 발화 구간과 묵음 구간에 따른 시간을 보여주는 자료입니다. '
        self.slient_cmt += '"발화 구간"이란 발표 중 아이가 실제로 말한 구간으로, 발화 시간이 길어질수록 아이가 말을 주절주절 이어나가는 경향을 가집니다. '
        self.slient_cmt += '"묵음 구간"이란 발표 중 아이가 말을 쉰 구간으로, 묵음 구간이 길어질수록 아이가 말하는 사이의 틈이 길어짐을 의미합니다. '

        if (self.toomuch_speak > 0) and (self.toomuch_quiet > 0):
            self.slient_cmt += '특히 아이가 발표에서 말을 오래 끌거나, 말을 오랫동안 하지 않는 경우가 종종 발견됩니다. '
            self.slient_cmt += '아이가 발표에 더욱 집중하여 말을 할 수 있도록 점검해주세요.'
        elif self.toomuch_speak > 0:
            self.slient_cmt += '특히 아이가 발표에서 말을 오래 끄는 경우가 종종 발견됩니다. '
            self.slient_cmt += '발표 중 적절한 타이밍에 말을 끊을 수 있도록 격려해주세요.'
        elif self.toomuch_quiet > 0:
            self.slient_cmt += '특히 아이가 발표에서 말을 오랫동안 하지 않는 경우가 종종 발견됩니다. '
            self.slient_cmt += '발표 중 불필요한 공백을 가지지 않고 말하도록 격려해주세요.'
        else:
            self.slient_cmt += '아이가 발표할 때 말을 오래 끌거나, 말을 오랫동안 하지 않는 경우 없이 적절하게 발표해 주었습니다.'
        self.speaktime_img = visualize_result(speak_time, '발화 구간', 25)
        self.quiettime_img = visualize_result(quiet_time, '묵음 구간', 10)

        
        # 목소리 속도 판단
        self.slow_tempo, self.fast_tempo = self.check_area(tempo, False)
        self.tempo_cmt = f'아이의 발표에서 목소리 속도를 나타낸 그래프입니다. '

        if (self.slow_tempo == True) and (self.fast_tempo == True):
            self.tempo_cmt += '특히 아이가 발표에서 목소리 속도를 일관되게 유지하지 못하며 평소보다 더 빠르거나 느린 목소리로 말한 경향이 보여집니다. '
            self.tempo_cmt += '발표 중 목소리 속도를 일관되게 유지할 수 있도록 점검해주세요.'
        elif self.slow_tempo == True:
            self.tempo_cmt += '특히 아이가 발표에서 목소리 속도를 평균보다 느리게 말하는 경향이 보여집니다. '
            self.tempo_cmt += '발표 중 여유를 가지며 적절한 속도로 발표할 수 있도록 격려해주세요.'
        elif self.fast_tempo == True:
            self.tempo_cmt += '특히 아이가 발표에서 목소리 속도를 평균보다 빠르게 말하는 경향이 보여집니다. '
            self.tempo_cmt += '발표 중 떨지 않고 안정된 상태로 발표할 수 있도록 격려해주세요.'
        else:
            self.tempo_cmt += '아이가 발표할 때 너무 빠르거나 느리게 말하지 않고 적절한 목소리 속도로 잘 발표해 주었습니다.'
        self.tempo_img = visualize_result(tempo, '목소리 속도', 25)

        
        # 목소리 크기 판단
        avg_volume = [0] * len(mean_volume)
        for i in range(len(mean_volume)):
            avg_volume[i] = float(mean_volume[i]) + float(max_volume[i])

        self.small_volume, self.big_volume = self.check_area(avg_volume, True)
        self.volume_cmt = f'아이의 발표에서 목소리 크기를 나타낸 그래프입니다. '

        if (self.small_volume == True) and (self.big_volume == True):
            self.volume_cmt += '특히 아이가 발표에서 목소리 크기를 일정하게 유지하지 못하며 평소보다 더 크거나 작은 목소리로 말한 경향이 보여집니다. '
            self.volume_cmt += '발표 중 목소리 크기를 일관되게 말할 수 있도록 점검해주세요.'
        elif self.small_volume == True:
            self.volume_cmt += '특히 아이가 발표에서 목소리 크기를 평균보다 작게 말하는 경향이 보여집니다. '
            self.volume_cmt += '발표 중 주눅들지 않고 자신감을 가지며 발표할 수 있도록 격려해주세요.'
        elif self.big_volume == True:
            self.volume_cmt += '특히 아이가 발표에서 목소리 크기를 평균보다 크게 말하는 경향이 보여집니다. '
            self.volume_cmt += '발표 중 너무 들뜨지 않고 차분하게 발표할 수 있도록 격려해주세요.'
        else:
            self.volume_cmt += '아이가 발표할 때 너무 크거나 작게 말하지 않고 적절한 목소리 크기로 잘 발표해 주었습니다.' 
        self.volume_img = visualize_result(avg_volume, '목소리 크기', 25)

    
    
    # 아이 인터페이스용 코멘트 생성
    def make_child_comment(self):
        if (self.toomuch_speak > 0) and (self.toomuch_quiet > 0):
            self.slient_cmt_c = '말할 때 침착하고 여유롭게 발표하면 좋을 것 같아요!'
        elif self.toomuch_speak > 0:
            self.slient_cmt_c = '지금보다 차분하게 발표하면 더 좋은 발표가 될 거에요!'
        elif self.toomuch_quiet > 0:
            self.slient_cmt_c = '지금보다 자신있게 발표하면 더 좋은 발표가 될 거에요!'
        else:
            self.slient_cmt_c = '너무 길거나 짧게 말하지 않고 명료하게 발표하느라 수고했어요! 아주 잘 했어요.'

            
        if (self.slow_tempo) and (self.fast_tempo):
            self.tempo_cmt_c = '말할 때 떨지 말고 차분하게 발표하면 좋을 것 같아요!'
        elif self.slow_tempo:
            self.tempo_cmt_c = '지금보다 조금만 빠르게 말하면 더 좋은 발표가 될 거에요!'
        elif self.fast_tempo:
            self.tempo_cmt_c = '지금보다 조금만 느리게 말하면 더 좋은 발표가 될 거에요!' 
        else:
            self.tempo_cmt_c = '목소리를 떨지 않고 또박또박 자신있게 발표하느라 수고했어요! 아주 잘 했어요.'

            
        if (self.small_volume) and (self.big_volume):
            self.volume_cmt_c = '목소리에 자신감을 가지고 발표하면 좋을 것 같아요!'
        elif self.small_volume:
            self.volume_cmt_c = '목소리를 더욱 크게 말하면 사람들이 잘 들을 수 있을 거에요!'
        elif self.big_volume:
            self.volume_cmt_c = '목소리를 좀 더 작게 말하면 사람들이 잘 들을 수 있을 거에요!'
        else:
            self.volume_cmt_c = '목소리를 또랑또랑하고도, 자신있게 잘 발표하느라 수고했어요! 아주 잘 했어요.'

    
    
    # 묵음 구간이 지나치게 짧은 경우 합쳐줌
    def set_slient(self, speak_time, quiet_time):
        new_speak_time = []
        new_quiet_time = []
        temp = 0
        for i in range(len(speak_time)):
            if i == len(speak_time)-1:
                new_speak_time.append(speak_time[i])
                break

            if quiet_time[i] <= 0.5:   # 0.5초 이하의 묵음 구간은 스킵
                temp += speak_time[i]
            else:
                temp += speak_time[i]
                new_speak_time.append(temp)
                new_quiet_time.append(quiet_time[i])
                temp = 0
        return new_speak_time, new_quiet_time

    
    
    # 발화/묵음 구간에서 길게 끈 경우를 카운트
    def check_slient(self, time, value):
        cnt = 0
        for i in range(len(time)):
            if time[i] > value:
                cnt += 1
        return cnt

    
    
    # 평균치보다 높거나 낮은 값 체크
    def check_area(self, scope, minus=False):
        avg   = sum(scope) // len(scope)
        flag1 = False
        flag2 = False
        ratio = 0.2

        if minus == True:
            for i in range(len(scope)):
                if scope[i] <= avg*(1+ratio):
                    flag1 = True
                elif avg*(1-ratio) <= scope[i]:
                    flag2 = True
        else:
            for i in range(len(scope)):
                if scope[i] <= avg*(1-ratio):
                    flag1 = True
                elif avg*(1+ratio) <= scope[i]:
                    flag2 = True
        return flag1, flag2
        
        
        
    # 스피치 분석 자료 생성
    def create_speech_document(self, speak_time, quiet_time, tempo, mean_volume, max_volume):
        self.make_parent_comment(speak_time, quiet_time, tempo, mean_volume, max_volume)
        self.make_child_comment()
        self.make_score()
        
        
        
    # 스피치 분석 자료 MongoDB에 업로드
    def upload_speech_document(self):
        audio_collection = AudioMaker().mongodb_connection('voices')

        # comment는 아이의 발표 결과에 따라 선정되며,
        # image는 별도의 폴더에 따로 저장됨
        audio_analysis = {
            'userFrom'     : self.userFrom,
            'createdAt'    : self.createdAt,
            
            'score'        : self.score,
            'slient_cmt'   : self.slient_cmt,
            'tempo_cmt'    : self.tempo_cmt,
            'volume_cmt'   : self.volume_cmt,
            
            'slient_cmt_c' : self.slient_cmt_c,
            'tempo_cmt_c'  : self.tempo_cmt_c,
            'volume_cmt_c' : self.volume_cmt_c
         }
        audio_collection.insert(audio_analysis)



# 발표 분석 자료 시각화
def visualize_result(value, legend, yrange):
    num_value = np.arange(1, len(value)+1, 1)
    plt.cla()
    
    plt.plot(num_value, value, marker='o', color='#a30fe2')
    plt.plot(num_value, value, label=legend, color='#f99dff')
    plt.ylim([min(value)-yrange, max(value)+yrange])
    
    plt.xticks(color='w')
    plt.yticks(color='w')    
    plt.tick_params(axis='x', bottom=False)
    plt.tick_params(axis='y', left=False)
    #plt.grid(True, axis='y')
    plt.legend(loc='upper left', fontsize=12)
    plt.savefig(img_save_path+f'\\Jasmine_목소리분석_{legend}.png')



# MongoDB에 올리기 위한 base64 인코딩
def encode_image_tobase64(imagepath):
    with open(imagepath, 'rb') as img_file:
        base64_string = base64.b64encode(img_file.read())
    return base64_string