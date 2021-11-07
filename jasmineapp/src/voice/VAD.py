import collections
import contextlib
import sys
import wave
import webrtcvad # pip(conda) install webrtcvad


def read_wave(path):
    with contextlib.closing(wave.open(path, 'rb')) as wf:
        num_channels = wf.getnchannels()
#         assert num_channels == 1
        sample_width = wf.getsampwidth()
        assert sample_width == 2
        sample_rate = wf.getframerate()
        assert sample_rate in (8000, 16000, 32000, 48000)
        print(f'sample rate {sample_rate}')
        pcm_data = wf.readframes(wf.getnframes())
        return pcm_data, sample_rate

class Frame(object):
    def __init__(self, bytes, timestamp, duration):
        self.bytes = bytes
        self.timestamp = timestamp
        self.duration = duration

def frame_generator(frame_duration_ms, audio, sample_rate):
    n = int(sample_rate * (frame_duration_ms / 1000.0) * 2)
    offset = 0
    timestamp = 0.0
    duration = (float(n) / sample_rate) / 2.0
    while offset + n < len(audio):
        yield Frame(audio[offset:offset + n], timestamp, duration)
        timestamp += duration
        offset += n

def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad, frames):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    triggered = False

    voiced_frames = []
    for frame in frames:
        # is_speech : 0 or 1 
        is_speech = vad.is_speech(frame.bytes, sample_rate)

        print('1' if is_speech else '0',end='')
        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])

            # trigger percentage
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                # trigger 시작
                print('+(%s)' % (ring_buffer[0][0].timestamp,))

                for f, s in ring_buffer:
                    voiced_frames.append(f)
                ring_buffer.clear()
        else:

            voiced_frames.append(frame)
            ring_buffer.append((frame, is_speech))
            num_unvoiced = len([f for f, speech in ring_buffer if not speech])

            # trigger: True -> False
            if num_unvoiced > 0.9 * ring_buffer.maxlen:
                # 여기서 보내기
                print('-(%s)' % (frame.timestamp + frame.duration))
                triggered = False
                yield b''.join([f.bytes for f in voiced_frames])
                ring_buffer.clear()
                voiced_frames = []
    if triggered:
        # 끝
        # 여기서 보내기
        print('-(%s)' % (frame.timestamp + frame.duration))
    print('\n')

    if voiced_frames:
        yield b''.join([f.bytes for f in voiced_frames])

def main(aggress, wavFile):
    audio, sample_rate = read_wave(wavFile)
    vad = webrtcvad.Vad(int(aggress))
    audio_ms = 10 # 30
    frames = frame_generator(audio_ms, audio, sample_rate)
    frames = list(frames)
    segments = vad_collector(sample_rate, audio_ms, 100, vad, frames)
    for i, segment in enumerate(segments):
        # path = 'chunk-%002d.wav' % (i,)
        pass
        # print(' Writing %s' % (path,))


if __name__ == '__main__':
    # 여기에 (0,1,2,3) 중 하나랑 파일 이름
    main('3', '보림아아.wav')
