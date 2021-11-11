import React, {forwardRef, useImperativeHandle} from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = forwardRef((props, ref) => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useImperativeHandle(ref, () => ({
        getDictStart() {
            SpeechRecognition.startListening
            if (!browserSupportsSpeechRecognition) {
                return <span>브라우저가 음성인식을 지원하지 않습니다.</span>;
            }
        },
        getDictStop() {
            SpeechRecognition.stopListening
            // transcript를 몽고db에 올리기

            
        },
        getDictReset() {
            resetTranscript
        },
    }));

    return (
        <>
        </>
    );
});
export default Dictaphone;