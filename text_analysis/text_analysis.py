import re
import numpy as np
import statistics
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'NanumGothic'
import warnings
warnings.filterwarnings(action='ignore')

from konlpy.tag import Okt, Kkma
from nltk.tokenize import sent_tokenize
from kss import split_sentences

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import normalize
from collections import Counter
from wordcloud import WordCloud, ImageColorGenerator
from PIL import Image
from pymongo import MongoClient
import getpass
import certifi
import base64



class TextAnalyzer:
    def __init__(self):
        self.okt = Okt()
        self.kkma = Kkma()
        self.stopwords = []
        with open('./stopwords-ko.txt', 'r', encoding='UTF8') as file:
            for line in file:
                self.stopwords.append(line.strip())
                
    

    # 어휘 다양도 반환
    def text2variety(self, text):
        pos = self.kkma.pos(text)
        count = Counter(pos)

        ttr_token = sum(count.values())
        ttr_type = len(count.keys())
        ttr = (ttr_type / ttr_token) * 100
        return round(ttr, 2)
             
            

    # 글을 문장 단위로 리턴
    def text2sentences(self, text):
        sentences = sent_tokenize(text)
        return sentences
    
    

    # 문장에서 명사 추출
    def sentences2nouns(self, sentences):
        nouns = []                      # 문장에 포함된 명사
        for sentence in sentences:
            for word in self.okt.nouns(str(sentence)):
                if word in self.stopwords or len(word) <= 1:
                    continue    
                if word in nouns:
                    continue
                nouns.append(word)
        return nouns
    
    

    # 공백 포함/제외 문장 길이 반환
    def sentences4count(self, sentences):
        num_sent = len(sentences)       # 전체 문장 개수
        len_sent = []                   # 각 문장 길이
        len_sent_blank_removed = []     # (공백 제외) 각 문장 길이
        
        for i in range(num_sent):
            cur_text = sentences[i]
            cur_blank_removed_text = re.sub(r' ', '', cur_text)
            len_sent.append(len(cur_text))
            len_sent_blank_removed.append(len(cur_blank_removed_text))
        return num_sent, len_sent, len_sent_blank_removed   
    
    

    # 공백 포함/제외 문장 길이 시각화
    def visualize_text4count(self, text):
        sentences = self.text2sentences(text)
        num_sent, len_sent, len_sent_blank_removed = self.sentences4count(sentences)
        num_len_sent = np.arange(1, len(len_sent)+1, 1)
        num_len_sent_blank_removed = np.arange(1, len(len_sent_blank_removed)+1, 1)

        plt.xlabel('문장 순서')
        plt.ylabel('문장 길이')
        plt.bar(num_len_sent, len_sent, label='공백포함', color='#f99dff')
        plt.bar(num_len_sent_blank_removed, len_sent_blank_removed, label='공백제외', color='#c54ac7')
        #plt.tick_params(left=False, bottom=False)
        plt.xticks([])
        plt.yticks([])
        plt.legend(loc='upper left', frameon=False, fontsize=10)
        plt.savefig('./Jasmine_sentence_count.png')
        sentcount_img = encode_image_tobase64('./Jasmine_sentence_count.png')
        return sentcount_img, num_sent, len_sent, len_sent_blank_removed
        
        #print(f' (공백포함) 문장 길이 평균값: {sum(len_sent)/len(len_sent)}')
        #print(f' (공백포함) 문장 길이 중앙값: {statistics.median(len_sent)}')
        #print(f' (공백제외) 문장 길이 평균값: {sum(len_sent_blank_removed)/len(len_sent_blank_removed)}')
        #print(f' (공백제외) 문장 길이 중앙값: {statistics.median(len_sent_blank_removed)}')



class WordAnalyzer:
    def __init__(self):
        self.text_analyze = TextAnalyzer()
        self.countvec = CountVectorizer()
        self.okt = Okt()
        self.stoptags = ['Determiner', 'Adverb', 'Conjunction', 'Exclamation', 'Josa']
        self.counttags = ['Noun', 'Verb', 'Adjective']
        self.essential_josa = ['은', '는', '이', '가', '을', '를']
        
        

    ####################   키워드 선정  
    # 가중치 그래프 생성
    def build_word_graph(self, sentence):
        countvec_mat = normalize(self.countvec.fit_transform(sentence).toarray().astype(float), axis=0)
        vocab = self.countvec.vocabulary_
        return np.dot(countvec_mat.T, countvec_mat), {vocab[word]: word for word in vocab}
    
    

    # 가중치 그래프에 TextRank 적용
    def get_ranks(self, graph, d=0.85):
        A = graph
        matrix_size = A.shape[0]
        for id in range(matrix_size):
            A[id, id] = 0    
            link_sum = np.sum(A[:, id])
            if link_sum != 0:
                A[:, id] /= link_sum
            A[:, id] *= -d
            A[id, id] = 1
            
        B = (1-d) * np.ones((matrix_size, 1))
        ranks = np.linalg.solve(A, B)
        return {idx: r[0] for idx, r in enumerate(ranks)}
    

    
    # 키워드 선정
    def text2keywords(self, text, word_num=15):        
        sentences = self.text_analyze.text2sentences(text)
        nouns = self.text_analyze.sentences2nouns(sentences)
        word_graph, idx2word = self.build_word_graph(nouns)
        word_rank_idx = self.get_ranks(word_graph)
        sorted_word_rank_idx = sorted(word_rank_idx, key=lambda k: word_rank_idx[k], reverse=True)
        
        keywords = []
        index = []
        
        for idx in sorted_word_rank_idx[:word_num]:
            index.append(idx)
        for idx in index:
            keywords.append(idx2word[idx])
        return keywords
    
    

    ####################   불용어 선정   
    # 단어 품사 태깅
    def text2postag(self, text):
        postag = self.okt.pos(text)
        return postag
    

    
    # 불용어 선정
    def text2stopwords(self, text):
        postag = self.text2postag(text)
        stopwords_postag = []
        
        for i in range(len(postag)):
            if (postag[i][1] in self.stoptags) and (postag[i][1] != 'Josa'):
                stopwords_postag.append(postag[i][0])
                continue
            
            if (postag[i][1] in self.stoptags) and (postag[i][1] == 'Josa'):
                if postag[i][0] not in self.essential_josa:
                    stopwords_postag.append(postag[i][0])
        return stopwords_postag
    

    
    ####################   빈도수 높은 단어 선정   
    # 빈도수 높은 단어 선정
    def text2countwords(self, text):
        postag = self.text2postag(text)
        countwords_postag = []
        
        for i in range(len(postag)):
            if postag[i][1] in self.counttags:
                countwords_postag.append(postag[i][0])
        return countwords_postag
    

    
    ####################   워드클라우드 시각화   
    # 워드클라우드에 넣기 위한 dict 리턴
    def words2wordscount(self, words, counttype):
        # keywords 선정시 가중치 부여
        if counttype == 'individual':
            whole = []
            for i in range(len(words)):
                for j in range(0, len(words)-i, 1):
                    whole.append(words[i])
            words = whole
        else:
            pass

        # 모든 경우에서 count를 통해 dict 생성
        count = Counter(words)
        wordscount = dict(count.most_common())
        
        # countwoords 선정시 단어 길이, 빈도수 1인 단어 제거
        if counttype == 'count':
            dict_key = list(wordscount.keys())
            for i in dict_key:
                if len(i) == 1:
                    del(wordscount[i])
                    continue
                
                if wordscount[i] == 1:
                    del(wordscount[i])
        else:
            pass
        return wordscount
    


    # 워드클라우드 시각화
    def visualize_wordcloud(self, text, wordtype):
        if wordtype == 'keywords':
            mask = np.array(Image.open('./wordcloud_keywords_rectangle.png'))
            words = self.text2keywords(text)
            words = self.words2wordscount(words, 'individual')
        
        elif wordtype == 'stopwords':
            mask = np.array(Image.open('./wordcloud_stopwords_rectangle.png'))
            words = self.text2stopwords(text)
            words = self.words2wordscount(words, 'none')
        
        elif wordtype == 'countwords':
            mask = np.array(Image.open('./wordcloud_countwords_circle.png'))
            words = self.text2countwords(text)
            words = self.words2wordscount(words, 'count')
        
        image_colors = ImageColorGenerator(mask)
        wordcloud = WordCloud(font_path='./NanumBarunGothic.ttf', background_color='white',
                              mask=mask, width=mask.shape[1], height=mask.shape[0], prefer_horizontal=0.99999)
        cloud = wordcloud.generate_from_frequencies(words)
        
        plt.figure(figsize=(8,8))
        plt.imshow(cloud.recolor(color_func=image_colors), interpolation='bilinear')
        plt.axis('off')
        plt.savefig(f'./Jasmine_wordcloud_{wordtype}.png')
        wordcloud_img = encode_image_tobase64(f'./Jasmine_wordcloud_{wordtype}.png')
        return wordcloud_img



def encode_image_tobase64(imagepath):
    with open(imagepath, 'rb') as img_file:
        base64_string = base64.b64encode(img_file.read())
    return base64_string

def make_comment(variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords):
    top3_keywords   = set_top3_words(top3_keywords)
    top3_stopwords  = set_top3_words(top3_stopwords)
    top3_countwords = set_top3_words(top3_countwords)

    # 어휘 다양도 판단
    variety_comment = f'어휘 다양도는 아이가 사용한 전체 낱말 중에서 다르게 사용한 낱말의 비율이 얼마인지 측정합니다. '
    variety_comment += '쉽게 말해 아이가 얼마나 다양한 어휘를 구사했는지에 대한 지표로 유아의 경우 20 ~ 40으로 나타난다고 합니다. '
    variety_comment += '이번 발표에서 아이의 어휘 다양도는 {variety}%로 확인됩니다. '
    if variety < 30:
        variety_comment += '아이의 어휘 다양도는 평균 혹은 조금 낮은 편으로 확인되며, 독서활동을 통해 아이가 더욱 다양한 단어를 구사할 수 있도록 지도해주세요.'
    else:
        variety_comment += '아이의 어휘 다양도가 평균 혹은 조금 높은 편으로 확인되며, 앞으로도 현재와 같이 다양한 단어를 구사할 수 있도록 격려해주세요.'

    # 문장 길이 판단
    short_sent, long_sent = check_area(len_sent)
    sentcount_comment  = f'아이가 발표에서 사용한 문장은 총 {num_sent}개로, 문장의 평균 길이는 {avg_sent}로 측정되었습니다. '
    sentcount_comment += '그래프에서는 문장 순서에 따라 공백을 포함하거나 제외한 상태에서 전체 문장 길이를 한눈에 확인하실 수 있습니다. '
    
    if (short_sent == True) and (long_sent == True):
        sentcount_comment += '특히 아이가 발표에서 평균 길이보다 짧거나 긴 문장을 자주 사용하는 것으로 보여집니다. '
        sentcount_comment += '표현하는 문장에 너무 짧거나 긴 문장이 속하지는 않았는지 점검해주세요.'
    elif short_sent == True:
        sentcount_comment += '특히 아이가 발표에서 평균 길이보다 짧은 문장을 사용하는 것으로 보여집니다. '
        sentcount_comment += '발표 중 너무 적은 내용의 불필요한 문장을 사용하지는 않았는지 점검해주세요.'
    elif long_sent == True:
        sentcount_comment += '특히 아이가 발표에서 평균 길이보다 긴 문장을 사용하는 것으로 보여집니다. '
        sentcount_comment += '발표 중 너무 많은 내용을 담은 문장을 사용하지는 않았는지 점검해주세요.'
    else:
        sentcount_comment += '아이가 표현하는 문장에 있어 너무 짧거나 긴 문장을 사용하지 않고 일관된 문장 길이로 잘 표현해 주었습니다.'

    # 키워드 판단
    keywords_comment   = f'아이의 발표에서 키워드로 인식된 단어는 {top3_keywords} 순이었습니다. '
    keywords_comment   += '그림은 키워드를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
    keywords_comment   += '아이가 발표에서 이 키워드들을 염두해서 발표하였는지 확인해주세요.'

    # 불용어 판단
    stopwords_comment  = f'아이의 발표에서 중요도가 낮으나 자주 사용된 단어는 {top3_stopwords} 순이었습니다. '
    stopwords_comment  += '그림은 중요도가 낮으나 자주 사용된 단어를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
    stopwords_comment  += '아이가 발표에서 이 단어들을 은연 중에 자주 말하지는 않는지 확인해주세요.'
    
    # 자주 사용된 단어 판단
    countwords_comment = f'아이의 발표에서 자주 사용된 단어는 {top3_countwords} 순이었습니다. '
    countwords_comment += '그림은 자주 사용된 단어를 시각화한 것으로, 단어 크기가 크거나 색깔이 눈에 띌 경우 아이가 자주 사용했음을 의미합니다. '
    countwords_comment += '자주 사용된 단어가 키워드에 속하는 편인지, 중요도가 낮은 단어인지 확인해주세요.'
    return variety_comment, sentcount_comment, keywords_comment, stopwords_comment, countwords_comment

def set_top3_words(words):
    words = str(words)
    words = re.sub(r'\[', '', words)
    words = re.sub(r'\]', '', words)
    words = re.sub(r'"', '', words)
    return words

def check_area(range):
    avg   = sum(range) // len(range)
    flag1 = False
    flag2 = False
    ratio = 0.4

    for i in range(len(range)):
        if range[i] <= avg*(1-ratio):
            flag1 = True
        elif avg*(1+ratio) <= range[i]:
            flag2 = True
    return flag1, flag2



def upload_speech_document(variety_comment, sentcount_comment, sentcount_image, keywords_comment, keywords_image,
                           stopwords_comment, stopwords_image, countwords_comment, countwords_image):
    host = 'mongodb+srv://seungukyu:0128@jasmine.iyjg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    client = MongoClient(host, tlsCAFile=certifi.where())
    database = client['myFirstDatabase']
    collection = database['text_result']

    # comment는 아이의 발표 결과에 따라 선정되며,
    # image는 발표 분석 통계 자료를 base64로 인코딩함
    text_analysis = {
        'user'              : getpass.getuser()
        'variety_comment'   : variety_comment,
        'sentcount_comment' : sentcount_comment,
        'sentcount_image'   : sentcount_image,
        'keywords_comment'  : keywords_comment,
        'keywords_image'    : keywords_image,
        'stopwords_comment' : stopwords_comment,
        'stopwords_image'   : stopwords_image,
        'countwords_comment': countwords_comment,
        'countwords_image'  : countwords_image
    }
    collection.insert(text_analysis)



if __name__ == '__main__':
    stttext = 'stt로 db에서 받아올 텍스트'
    
    TA = TextAnalyzer()     # 텍스트 분석 클래스
    WA = WordAnalyzer()     # 단어 분석 클래스

    variety     = TA.text2variety(stttext)             # 어휘 다양도
    sentcount_image, num_sent, len_sent, len_sent_blank_removed = TA.visualize_text4count(stttext)     # 문장 길이 통계

    top3_keywords   = WA.text2keywords(stttext)[:3]       # 키워드 상위 3개
    top3_stopwords  = WA.text2keywords(stttext)[:3]       # 불용어 상위 3개
    top3_countwords = WA.text2countwords(stttext)[:3]     # 빈도수 높은 단어 상위 3개
    wordcloud_keyword_image   = WA.visualize_wordcloud(stttext, 'keywords')       # 키워드 워드클라우드
    wordcloud_stopword_image  = WA.visualize_wordcloud(stttext, 'stopwords')      # 불용어 워드클라우드
    wordcloud_countword_image = WA.visualize_wordcloud(stttext, 'countwords')     # 빈도수 높은 단어 워드클라우드

    # 학부모 인터페이스용 코멘트 생성
    variety_comment, sentcount_comment, keywords_comment, stopwords_comment, countwords_comment =\
        make_comment(variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords)

    # DB에 학부모 인터페이스용 코멘트 및 분석 자료 등록
    upload_speech_document(variety_comment, sentcount_comment, sentcount_image,\
                          keywords_comment, wordcloud_keyword_image,\
                          stopwords_comment, wordcloud_stopword_image,\
                          countwords_comment, wordcloud_countword_image)
