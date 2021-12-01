import re
import os
import math
import time
import base64
import urllib
import subprocess
import numpy as np

import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'NanumGothic'

import warnings
warnings.filterwarnings(action='ignore')

from selenium import webdriver
from bs4 import BeautifulSoup
from pymongo import MongoClient
import certifi



class TextMaker():
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

    
    
    # stt text를 반환
    def get_stt_text(self):
        # DB에 stt가 올려진 발표 정보
        stt_collection = self.mongodb_connection('speechtexts')
        stt_docs = list(stt_collection.find())
        stt_userFrom, stt_createdAt = self.mongodb_userinfo(stt_docs)

        # DB에 내용 분석이 올려진 발표 정보
        text_collection = self.mongodb_connection('words')
        text_docs = list(text_collection.find())
        text_userFrom, text_createdAt = self.mongodb_userinfo(text_docs)

        # 'stt는 있으나 내용 분석이 안올려진 발표'라면 해당 정보를 리턴
        complement_userFrom  = list(set(stt_userFrom) - set(text_userFrom))
        complement_createdAt = list(set(stt_createdAt) - set(text_createdAt))
        try:
            upload_userFrom  = complement_userFrom[0]
            upload_createdAt = complement_createdAt[0]
        except:
            pass

        upload_docs = stt_collection.find({'userFrom' : upload_userFrom,
                                           'createdAt': upload_createdAt})
        for doc in upload_docs:
            stt_texts = doc['text']
        stt_text = ''
        for text in stt_texts:
            stt_text += text
            stt_text += ' '
        return stt_text, upload_userFrom, upload_createdAt



class CommentMaker():
    def __init__(self, userFrom, createdAt):
        self.userFrom  = userFrom
        self.createdAt = createdAt
        
        self.score            = None
        self.variety_cmt      = None
        self.sentcount_cmt    = None
        
        self.keywords_cmt     = None
        self.top3_keywords    = None
        self.stopwords_cmt    = None
        self.top3_stopwords   = None
        self.countwords_cmt   = None
        self.top3_countwords  = None
        
        self.keywords_cmt_c   = None
        self.stopwords_cmt_c  = None
        self.countwords_cmt_c = None
        
        
        
    # 발표 점수(내용) 측정
    def make_score(self, variety, num_sent):
        if num_sent <= 3:
            score = variety / 3.5
        elif num_sent <= 6:
            score = variety / 3
        else:
            score = variety / 2.5
        self.score = math.floor(score)
    
    
    
    # 학부모 인터페이스용 코멘트 생성
    def make_parent_comment(self, variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords):
        # 어휘 다양도 판단
        self.variety_cmt = f'어휘 다양도는 아이가 사용한 전체 낱말 중에서 다르게 사용한 낱말의 비율이 얼마인지 측정합니다. '
        self.variety_cmt += '쉽게 말해 아이가 얼마나 다양한 어휘를 구사했는지에 대한 지표로 유아의 경우 20 ~ 40으로 나타난다고 합니다. '
        self.variety_cmt += '이번 발표에서 아이의 어휘 다양도는 {variety}%로 확인됩니다. '
        if variety < 30:
            self.variety_cmt += '아이의 어휘 다양도는 평균 혹은 조금 낮은 편으로 확인되며, 독서활동을 통해 아이가 더욱 다양한 단어를 구사할 수 있도록 지도해주세요.'
        else:
            self.variety_cmt += '아이의 어휘 다양도가 평균 혹은 조금 높은 편으로 확인되며, 앞으로도 현재와 같이 다양한 단어를 구사할 수 있도록 격려해주세요.'

            
        # 문장 길이 판단
        short_sent, long_sent = self.check_area(len_sent)
        avg_sent = sum(len_sent) // num_sent
        self.sentcount_cmt  = f'아이가 발표에서 사용한 문장은 총 {num_sent}개로, 문장의 평균 길이는 {avg_sent}로 측정되었습니다. '
        self.sentcount_cmt += '그래프에서는 문장 순서에 따라 공백을 포함하거나 제외한 상태에서 전체 문장 길이를 한눈에 확인하실 수 있습니다. '

        if (short_sent == True) and (long_sent == True):
            self.sentcount_cmt += '특히 아이가 발표에서 평균 길이보다 짧거나 긴 문장을 자주 사용하는 것으로 보여집니다. '
            self.sentcount_cmt += '표현하는 문장에 너무 짧거나 긴 문장이 속하지는 않았는지 점검해주세요.'
        elif short_sent == True:
            self.sentcount_cmt += '특히 아이가 발표에서 평균 길이보다 짧은 문장을 사용하는 것으로 보여집니다. '
            self.sentcount_cmt += '발표 중 너무 적은 내용의 불필요한 문장을 사용하지는 않았는지 점검해주세요.'
        elif long_sent == True:
            self.sentcount_cmt += '특히 아이가 발표에서 평균 길이보다 긴 문장을 사용하는 것으로 보여집니다. '
            self.sentcount_cmt += '발표 중 너무 많은 내용을 담은 문장을 사용하지는 않았는지 점검해주세요.'
        else:
            self.sentcount_cmt += '아이가 표현하는 문장에 있어 너무 짧거나 긴 문장을 사용하지 않고 일관된 문장 길이로 잘 표현해 주었습니다.'

            
        # 키워드 판단
        self.top3_keywords = self.set_top3_words(top3_keywords)
        self.keywords_cmt  = f'아이의 발표에서 키워드로 인식된 단어는 {self.top3_keywords} 순이었습니다. '
        self.keywords_cmt += '그림은 키워드를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
        self.keywords_cmt += '아이가 발표에서 이 키워드들을 염두해서 발표하였는지 확인해주세요.'

        
        # 불용어 판단
        self.top3_stopwords = self.set_top3_words(top3_stopwords)
        self.stopwords_cmt  = f'아이의 발표에서 중요도가 낮으나 자주 사용된 단어는 {self.top3_stopwords} 순이었습니다. '
        self.stopwords_cmt += '그림은 중요도가 낮으나 자주 사용된 단어를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
        self.stopwords_cmt += '아이가 발표에서 이 단어들을 은연 중에 자주 말하지는 않는지 확인해주세요.'

        
        # 자주 사용된 단어 판단
        self.top3_countwords = self.set_top3_words(top3_countwords)
        self.countwords_cmt  = f'아이의 발표에서 자주 사용된 단어는 {self.top3_countwords} 순이었습니다. '
        self.countwords_cmt += '그림은 자주 사용된 단어를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
        self.countwords_cmt += '자주 사용된 단어가 키워드에 속하는 편인지, 중요도가 낮은 단어인지 확인해주세요.'

    
    
    # 아이 인터페이스용 코멘트 생성
    def make_child_comment(self):
        self.keywords_cmt_c   = f'이번 발표에는 {self.top3_keywords}라는 단어를 주제로 발표했군요! 발표 잘 들었어요.'
        self.stopwords_cmt_c  = f'다음 발표에는 {self.top3_stopwords}라는 단어를 조금 덜 써서 말해볼까요? 오늘 수고했어요.'
        self.countwords_cmt_c = f'이번 발표에는 {self.top3_countwords}라는 단어를 많이 사용했군요! 좋은 발표였어요.'
     
    
    
    # 구두점 제거 
    def set_top3_words(self, words):
        words = str(words)
        words = re.sub(r'\[', '', words)
        words = re.sub(r'\]', '', words)
        words = re.sub(r'"', '', words)
        return words

    
    
    # 평균치보다 높거나 낮은 값 체크
    def check_area(self, scope):
        avg   = sum(scope) // len(scope)
        flag1 = False
        flag2 = False
        ratio = 0.4

        for i in range(len(scope)):
            if scope[i] <= avg*(1-ratio):
                flag1 = True
            elif avg*(1+ratio) <= scope[i]:
                flag2 = True
        return flag1, flag2
    
    
    
    # 스피치 분석 자료 생성
    def create_speech_document(self, variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords):
        self.make_parent_comment(variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords)
        self.make_child_comment()
        self.make_score(variety, num_sent)
    
    
    
    # 스피치 분석 자료 MongoDB에 업로드
    def upload_speech_document(self):
        text_collection = TextMaker().mongodb_connection('words')

        # comment는 아이의 발표 결과에 따라 선정되며,
        # image는 별도의 폴더에 따로 저장됨
        text_analysis = {
            'userFrom'        : self.userFrom,
            'createdAt'       : self.createdAt, 
            
            'score'           : self.score,
            'variety_cmt'     : self.variety_cmt,
            'sentcount_cmt'   : self.sentcount_cmt,

            'keywords_cmt'    : self.keywords_cmt,
            'top3_keywords'   : self.top3_keywords,
            'stopwords_cmt'   : self.stopwords_cmt,
            'top3_stopwords'  : self.top3_stopwords,
            'countwords_cmt'  : self.countwords_cmt,
            'top3_countwords' : self.top3_countwords,
            
            'keywords_cmt_c'  : self.keywords_cmt_c,
            'stopwords_cmt_c' : self.stopwords_cmt_c,
            'countwords_cmt_c': self.countwords_cmt_c
        }
        text_collection.insert(text_analysis)