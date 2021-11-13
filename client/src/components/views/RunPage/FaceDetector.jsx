import React, { useRef, useState} from 'react';
import { withRouter } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import gaze from 'gaze-detection';
import AudioRecorder from './AudioRecorder';

const CONSTRAINTS = { video: true };


function FaceDetector(props) {
    const recordRef = useRef({});
    const [btn,setBtn] = useState('');
    let click_style = 'display: none';
    const camera = React.useRef();
    const camera_temp = React.useRef();
    const figures = React.useRef();
    const webcamElement = camera.current;

    // dictaphone
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const dictStart = () => {
        SpeechRecognition.startListening({ continuous: true });
        if (!browserSupportsSpeechRecognition) {
            return <span>브라우저가 음성인식을 지원하지 않습니다.</span>;
        }
    };
    const dictStop = () => {
        SpeechRecognition.stopListening();
        console.log({ transcript });
        // mongoDB 저장
        resetTranscript();
    };

    const allStop = async () => {
        console.log('end~~~');
        // stop dictaphone
        dictStop();
        camera.current = null
        camera_temp.current = null
    };

    
    

    const run = async () => {
        const model = await blazeface.load();
        await gaze.loadModel();

        const webcam = await tf.data.webcam(webcamElement, {
            resizeWidth: 220,
            resizeHeight: 227,
        });

        await gaze.setUpCamera(camera_temp.current);

        while (true) {
            // 종료 버튼 클릭 시
            if (props.isEnd === true) {
                return;
                // 여기서 다시 home으로
            }
            try {
                const img = await webcam.capture();
                const returnTensors = false;
                const predictions = await model.estimateFaces(img, returnTensors);
                const gazePrediction = await gaze.getGazePrediction();
                let check = false;

                for (let i = 0; i < predictions.length; i++) {
                    if (figures.current) {
                        figures.current.innerText = String(predictions[i].probability[0]).substring(0, 5);
                        console.log('Gaze direction: ', gazePrediction); //will return 'RIGHT', 'LEFT', 'STRAIGHT' or 'TOP'
                        check = true;
                    }
                }
                if (figures.current && !check) {
                    figures.current.innerText = '얼굴을 보여주세요';
                }
                if (check) {
                    for (let i = 0; i < predictions.length; i++) {
                        if (figures.current) {
                            const face_center = (predictions[i].bottomRight[0] + predictions[i].topLeft[0]) / 2;
                            if (predictions[i].landmarks[2][0] < face_center - 10 || predictions[i].landmarks[2][0] > face_center + 10) {
                                figures.current.innerText = '얼굴을 정면으로 향해주세요.';
                                // figures.current.innerText = '얼굴을 정면으로 향해주세요.' +
                                // "\ntopLeft: " + String(predictions[i].topLeft[0]).substr(0, 5) + ", " + String(predictions[i].topLeft[1]).substr(0, 5) +
                                // "\nbottomRight: " + String(predictions[i].bottomRight[0]).substring(0, 5) + ", " + String(predictions[i].bottomRight[1]).substring(0, 5) +
                                // "\neyeLeft: " + String(predictions[i].landmarks[0][0]).substr(0, 5) + ", " + String(predictions[i].landmarks[0][1]).substring(0, 5) +
                                // "\neyeRight: " + String(predictions[i].landmarks[1][0]).substr(0, 5) + ", " + String(predictions[i].landmarks[1][1]).substring(0, 5) +
                                // "\nnose: " + String(predictions[i].landmarks[2][0]).substr(0, 5) + ", " + String(predictions[i].landmarks[2][1]).substring(0, 5) +
                                // "\nmouth: " + String(predictions[i].landmarks[3][0]).substr(0, 5) + ", " + String(predictions[i].landmarks[3][1]).substring(0, 5);
                            }
                        }
                    }
                }
                img.dispose();
                await tf.nextFrame();
            } catch (e) {
                console.error(e);
                continue;
            }
        }
    };
    const ShowButton = styled.button`
        display : ${btn};
        outline: none;
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        width: 20%;
        height: 15%;
        margin: 5%;
        font-size: 30px;
        cursor: pointer;
        padding-left: 1rem;
        padding-right: 1rem;

        /* 색상 */
        background: #228be6;
        &:hover {
            background: ${lighten(0.1, '#228be6')};
        }
        &:active {
            background: ${darken(0.1, '#228be6')};
        }
    `;

    const startVideo = async () => {
        dictStart();
        click_style = '';
        setBtn('none');
        const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        if (camera && camera.current && !camera.current.srcObject) {
            camera.current.srcObject = stream;
        }
        if (camera_temp && camera_temp.current && !camera_temp.current.srcObject) {
            camera_temp.current.srcObject = stream;
        }
        
        run();
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        allStop();

        props.history.push('/finish');
    };
    return (
        <>
            <div style={{display:'none'}}>
                <AudioRecorder ref = {recordRef} />
                {/* <AudioReactRecorder state={recordState} onStop={onStop}/> */}
            </div>
            <ShowButton onClick={
                ()=>{
                    recordRef.current.start();
                    startVideo();
                    }}> 시작하기</ShowButton>
            <div className="facedetector" style={{click_style}}>
                <div className="test" ref={figures}></div>
                <video id="webcam" autoPlay muted={true} ref={camera} />
                <video id="hiddencam" autoPlay muted={true} ref={camera_temp}/>
            </div>
            <div className="stopButton">
                <form style={{ display: 'flex', flexDirection: 'column'}} onSubmit={onSubmitHandler}>
                    <button onClick={recordRef.current.stop} type="submit">끝내기</button>
                </form>
            </div>
            
        </>
    );
};
export default withRouter(FaceDetector);
