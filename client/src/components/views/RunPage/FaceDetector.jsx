import React, { useRef, useState, useCallback } from 'react';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import testImg from '../../../img/test.png';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import gaze from 'gaze-detection';

import axios from 'axios';

const CONSTRAINTS = { video: true };

const ShowButton = styled.button`
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

// canvas 추가 시 찾은 얼굴 redbox 표시가능
const FaceDetector = (props) => {
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

    // recorder
    const [recordState, setRecordState] = useState(null);
    const onStop = (audioData) => {
        console.log('audioData', audioData);
        console.log(audioData.url);
    };

    let model;
    const [click, setClick] = useState(false);
    const camera = React.useRef();
    const camera_temp = React.useRef();
    const figures = React.useRef();
    const webcamElement = camera.current;

    const startVideo = async () => {
        setClick(true);
        const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        if (camera && camera.current && !camera.current.srcObject) {
            camera.current.srcObject = stream;
        }
        if (camera_temp && camera_temp.current && !camera_temp.current.srcObject) {
            camera_temp.current.srcObject = stream;
        }
        if (RecordState !== 'START') {
            // start dictaphone
            dictStart();

            // start recording
            setRecordState(RecordState.START);
        }
    };

    const run = async () => {
        model = await blazeface.load();
        await gaze.loadModel();

        const webcam = await tf.data.webcam(webcamElement, {
            resizeWidth: 220,
            resizeHeight: 227,
        });

        await gaze.setUpCamera(camera_temp.current);

        while (true) {
            // 종료 버튼 클릭 시
            if (props.isEnd === true) {
                console.log('end~~~');
                // stop recording
                setRecordState(RecordState.STOP);
                // stop dictaphone
                dictStop();
                break;
                // 여기서 다시 home으로
                // axios.get('/home',{});
            }
            try {
                // let ctx = camera.getContext('2d');
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

    const mounted = useRef(false);

    React.useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
            console.log('ready');
            run();
        }
    });
    if (click === false) {
        return (
            <>
                <ShowButton onClick={startVideo}> 시작하기</ShowButton>
            </>
        );
    } else {
        return (
            <>
                <div className="facedetector">
                    <div className="test" ref={figures}></div>
                    <video id="webcam" autoPlay muted={true} ref={camera} poster={testImg} />
                    <video id="hiddencam" autoPlay muted={true} ref={camera_temp} poster={testImg} />
                </div>
                <div className="audio">
                    <AudioReactRecorder state={recordState} onStop={onStop} />
                    {/* <Dictaphone ref = {dictRef}/> */}
                </div>
            </>
        );
    }
};
export default FaceDetector;
