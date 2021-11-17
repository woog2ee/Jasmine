import sys
import requests, json
import wave
import webrtcvad
import contextlib
import collections



class Frame(object):
    def __init__(self, bytes, timestamp, duration):
        self.bytes = bytes
        self.timestamp = timestamp
        self.duration = duration



class SlientAnalyzer():
    def __init__(self, audiofile):
        with contextlib.closing(wave.open(audiofile, 'rb')) as wf:
            num_channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            
            assert sample_width == 2
            self.sample_rate = wf.getframerate()
            assert self.sample_rate in (8000, 16000, 32000, 48000)
            self.pcm_data = wf.readframes(wf.getnframes())
        
        self.start_time = []     # 발화 시작 구간
        self.end_time = []       # 발화 끝 구간
        
        
        
    # 발화 및 묵음 시간 반환
    def slient_analyze(self, audiofile):
        aggress = 3
        audio_ms = 10
        vad = webrtcvad.Vad(int(aggress))
        
        frames = self.frame_generator(audio_ms)
        frames = list(frames)
        segments = self.vad_collector(audio_ms, 100, vad, frames)

        for i, segment in enumerate(segments):
            pass
        speak_time, quiet_time = self.find_speak_quite_time()
        return speak_time, quiet_time
        
        
        
    def frame_generator(self, frame_duration_ms):
        audio = self.pcm_data
        sr = self.sample_rate
        n = int(sr * (frame_duration_ms / 1000.0) * 2)
        
        offset = 0
        timestamp = 0.0
        duration = (float(n) / sr) / 2.0
        while offset + n < len(audio):
            yield Frame(audio[offset:offset + n], timestamp, duration)
            timestamp += duration
            offset += n

        
        
    def vad_collector(self, frame_duration_ms, padding_duration_ms, vad, frames):
        sr = self.sample_rate
        num_padding_frames = int(padding_duration_ms / frame_duration_ms)
        ring_buffer = collections.deque(maxlen=num_padding_frames)
        triggered = False

        voiced_frames = []
        for frame in frames:
            is_speech = vad.is_speech(frame.bytes, sr)

            if not triggered:
                ring_buffer.append((frame, is_speech))
                num_voiced = len([f for f, speech in ring_buffer if speech])

                # 말을 시작하는 순간
                if num_voiced > 0.9 * ring_buffer.maxlen:
                    self.start_time.append(ring_buffer[0][0].timestamp,)
                    
                    triggered = True
                    for f, s in ring_buffer:
                        voiced_frames.append(f)
                    ring_buffer.clear()
            else:

                voiced_frames.append(frame)
                ring_buffer.append((frame, is_speech))
                num_unvoiced = len([f for f, speech in ring_buffer if not speech])

                # 말을 끝내는 순간
                if num_unvoiced > 0.9 * ring_buffer.maxlen:
                    self.end_time.append(frame.timestamp + frame.duration)
                    
                    triggered = False
                    yield b''.join([f.bytes for f in voiced_frames])
                    ring_buffer.clear()
                    voiced_frames = []
        if triggered:
            self.end_time.append(frame.timestamp + frame.duration)

        if voiced_frames:
            yield b''.join([f.bytes for f in voiced_frames])
            
            
            
    def find_speak_quite_time(self):
        start_time = self.start_time
        end_time = self.end_time

        speak_time = []     # 발화 시간
        quiet_time = []     # 묵음 시간

        for i in range(len(start_time)):
            talking = end_time[i] - start_time[i]
            talking = round(talking, 3)
            speak_time.append(talking)

            if i >= 1:
                calming = start_time[i] - end_time[i-1]
                calming = round(calming, 3)
                quiet_time.append(calming)
        return speak_time, quiet_time
