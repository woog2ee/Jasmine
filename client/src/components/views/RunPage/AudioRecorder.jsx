import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Axios from 'axios';

const AudioRecorder = forwardRef((props, ref) => {
    const userFrom = props.userFrom;
    const [recordState, setRecordState] = useState(null);

    const onStop = (audioData) => {
        console.log('audioData', audioData);
        console.log(audioData.url);

        let body = {
            userFrom: userFrom,
            audioUrl: audioData.url,
        };

        Axios.post('/api/run/voice', body).then((response) => {
            if (response.data.success) {
            } else {
                alert('Voice error');
            }
        });
    };

    const start = () => {
        setRecordState(RecordState.START);
    };
    const stop = () => {
        setRecordState(RecordState.STOP);
    };

    useImperativeHandle(ref, () => ({
        start,
        stop,
    }));

    return (
        <>
            <div className="audioRecord" style={{ display: 'none' }}>
                <AudioReactRecorder state={recordState} onStop={onStop} />
            </div>
            <button onClick={start}>Start</button>
            <button onClick={stop}>STOP</button>
        </>
    );
});

export default AudioRecorder;
