import re
import base64
import numpy as np
from PIL import Image
from collections import Counter
from wordcloud import WordCloud, ImageColorGenerator
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'NanumGothic'
import warnings
warnings.filterwarnings(action='ignore')

from konlpy.tag import Okt, Kkma
from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import normalize
from make_textfile import TextMaker
from make_textfile import CommentMaker



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



# MongoDB에 올리기 위한 base64 인코딩
def encode_image_tobase64(imagepath):
    with open(imagepath, 'rb') as img_file:
        base64_string = base64.b64encode(img_file.read())
    return base64_string



if __name__ == '__main__':
    stttext, userFrom, createdAt = TextMaker().get_stt_text()     # 발표 텍스트 및 유저 정보 로드
    
    TA = TextAnalyzer()     # 텍스트 분석 클래스
    WA = WordAnalyzer()     # 단어 분석 클래스

    variety = TA.text2variety(stttext)                                                               # 어휘 다양도
    sentcount_img, num_sent, len_sent, len_sent_blank_removed = TA.visualize_text4count(stttext)     # 문장 길이 통계

    top3_keywords   = WA.text2keywords(stttext)[:3]                    # 키워드 상위 3개
    top3_stopwords  = WA.text2keywords(stttext)[:3]                    # 불용어 상위 3개
    top3_countwords = WA.text2countwords(stttext)[:3]                  # 빈도수 높은 단어 상위 3개
    keywords_img   = WA.visualize_wordcloud(stttext, 'keywords')       # 키워드 워드클라우드
    stopwords_img  = WA.visualize_wordcloud(stttext, 'stopwords')      # 불용어 워드클라우드
    countwords_img = WA.visualize_wordcloud(stttext, 'countwords')     # 빈도수 높은 단어 워드클라우드

    # 분석 자료 만들고 MongoDB에 업로드
    CM = CommentMaker(userFrom, createdAt)
    CM.create_speech_document(variety, num_sent, len_sent, top3_keywords, top3_stopwords, top3_countwords,
                              sentcount_img, keywords_img, stopwords_img, countwords_img)
    CM.upload_speech_document()
