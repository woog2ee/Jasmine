import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = () => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    return (
        <div>
            <button onclick = {() => {
                console.log('start');
                SpeechRecognition.startListening({ continuous: true })
                if (!browserSupportsSpeechRecognition) {
                    return <span>브라우저가 음성인식을 지원하지 않습니다.</span>;
                }
            }}>
                발표시작
            </button>
            <button onclick = {() => {
                console.log('stop');
                SpeechRecognition.stopListening();
                // transcript를 몽고db에 올리기
            }}>
                발표종료
            </button>
        </div>
    );
};
export default Dictaphone;