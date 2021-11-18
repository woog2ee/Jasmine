import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import React, {useState, forwardRef, useImperativeHandle} from 'react'

const mongoose = require('mongoose')
const AudioRecorder = forwardRef((props, ref) => {
    const [recordState, setRecordState] = useState(null);

    const onStop = (audioData) => {
        console.log('audioData', audioData);
        console.log(audioData.url);
    }

    const start = () => {
        setRecordState(RecordState.START);
    }
    const stop = () => {
        setRecordState(RecordState.STOP);
        
    }

    useImperativeHandle(ref, () => ({
        start,
        stop
    }));


    return (
        <>
        <div className='audioRecord' style={{display:'none'}}>
            <AudioReactRecorder state={recordState} onStop={onStop} />
        </div>
        <button onClick={start}>Start</button>
        <button onClick={stop}>STOP</button>
        </>
    )
});

export default AudioRecorder;