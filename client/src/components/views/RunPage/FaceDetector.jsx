import React, { useState} from 'react';
import { useSpring, config, animated } from 'react-spring';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import gaze from './Gaze';
import sloth from '../../../img/sloth512.png';
import koala from '../../../img/koala512.png';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import useInterval from 'use-interval';
import download from 'downloadjs';
import fs from 'fs';
// import path from 'path';

const CONSTRAINTS = { video: true };
const ShowButton = styled(animated.button)`
    outline: none;
    border: none;
    border-radius: 10px;
    color: white;
    width: 300px;
    padding: 2rem;
    height: 30%;
    margin: 0 auto;
    font-size: 30px;
    cursor: pointer;
    font-family: 'CookieRunOTF-Bold';

    /* 색상 */
    background: #c54ac7;
    &:hover {
        background: ${lighten(0.1, '#C54AC7')};
    }
    &:active {
        background: ${darken(0.1, '#C54AC7')};
    }
`;

function FaceDetector(props) {
    const userFrom = props.userFrom;
    const [recordState, setRecordState] = useState(null);
    const [btnVisible, setBtn] = useState(true);
    const camera = React.useRef();
    const webcamElement = camera.current;
    const figures = React.useRef();

    const [score, setScore] = useState(50);
    const [comment, setComment] = useState('');
    const [isToggle, setToggle] = useState(null);
    const [timestamp, setTimestamp] = useState();

    const appearSloth = useSpring({
        config: config.stiff,
        x: 280,
        opacity: isToggle ? 1 : 0,
        y: -350,
    });
    const appearSlothText = useSpring({
        config: config.stiff,
        x: 130,
        opacity: isToggle ? 1 : 0,
        y: -200,
    });
    const appearKoala = useSpring({
        config: config.stiff,
        x: -690,
        opacity: (isToggle!=false)? 0 : 1,
        y: 100,
    });
    const appearKoalaText = useSpring({
        config: config.stiff,
        x: -200,
        opacity: (isToggle!=false)? 0 : 1,
        y: 0,
    });
    const { x } = useSpring({
        loop: true,
        from: { x: 0 },
        to: { x: 1 },
        config: { duration: 2000 },
    });

    const allStop = async () => {
        console.log('end~~~');
        dictStop();
        camera.current = null;
        // camera_temp.current = null;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        let body = {
            userFrom: userFrom,
            score: score,
            comment: comment,
            createdAt: timestamp,
        };

        await allStop();

        Axios.post('/api/run/vision', body).then((response) => {
            if (response.data.success) {
                props.history.push('/loading');
            } else {
                alert('Vision error');
            }
        });
    };

    // dictaphone
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    const [script, setScript] = useState([]);

    const dictStart = () => {
        SpeechRecognition.startListening({ continuous: true });
        if (!browserSupportsSpeechRecognition) {
            return <span>브라우저가 음성인식을 지원하지 않습니다.</span>;
        }
        const curr = new Date();
        setTimestamp(curr);
        console.log(curr);
    };
    useInterval(() => {
        if(!btnVisible){
            setScript(script.concat(transcript));
            console.log(transcript);
            console.log(script);
            resetTranscript();
        }
    }, 5000);
    
    
    const dictStop = async() => {
        setTimeout(async function(){
            const tmp = script.concat(transcript);
            SpeechRecognition.stopListening();
            // setScript(script.concat(transcript));
            // setScript(() => [...script,transcript]);
            
            console.log(transcript);
            // console.log(script);
            console.log(tmp);

            let body = {
                userFrom: userFrom,
                text: tmp,
                createdAt: timestamp,
                //text: transcript,
            };
    
            await Axios.post('/api/run/speechtext', body).then((response) => {
                if (response.data.success) {
                } else {
                    alert('Speechtext error');
                }
            });
        },1000)
    };
    

    const run = async () => {
        const model = await blazeface.load();
        await gaze.loadModel();
        var left_gaze = 0;
        var right_gaze = 0;

        const webcam = await tf.data.webcam(webcamElement, {
            resizeWidth: 220,
            resizeHeight: 227,
        });

        await gaze.setUpCamera(camera.current);

        const predict = async () => {
            while (true) {
                try {
                    let check = false;
                    const img = await webcam.capture();
                    const predictions = await model.estimateFaces(img, false);

                    const gazePrediction = await gaze.getGazePrediction();
                    for (let i = 0; i < predictions.length; i++) {
                        if (figures.current) {
                            // figures.current.innerText = String(predictions[i].probability[0]).substring(0, 5);
                            console.log('Gaze direction: ', gazePrediction); //will return 'RIGHT', 'LEFT', 'STRAIGHT' or 'TOP'
                            if (gazePrediction === 'LEFT' || gazePrediction === 'RIGHT') {
                                setScore((preScore) => preScore - 1);
                                if (gazePrediction === 'LEFT') {
                                    left_gaze += 1;
                                } else {
                                    right_gaze += 1;
                                }
                                if (left_gaze > right_gaze) {
                                    setComment('발표 중에 왼쪽을 바라보는 경향이 있어요.');
                                } else {
                                    setComment('발표 중에 오른쪽을 바라보는 경향이 있어요.');
                                }
                            } else if (gazePrediction === 'STRAIGHT' || gazePrediction === 'TOP' || gazePrediction === 'BOTTOM') {
                                setScore((preScore) => preScore + 1);
                            }
                            check = true;
                        }
                    }

                    if (figures.current && !check) {
                        if (!isToggle) {
                            setToggle((isToggle) => true);
                        }
                        figures.current.innerText = '         얼굴을 보여주세요.         ';
                    }
                    if (check) {
                        for (let i = 0; i < predictions.length; i++) {
                            if (figures.current) {
                                // console.log(predictions[i]);
                                const face_center = (predictions[i].bottomRight[0] + predictions[i].topLeft[0]) / 2;
                                if (
                                    predictions[i].landmarks[2][0] < face_center - 10 ||
                                    predictions[i].landmarks[2][0] > face_center + 10
                                ) {
                                    figures.current.innerText = '얼굴을 정면으로 향해주세요.';
                                    setScore((preScore) => preScore - 1);
                                    if (isToggle != true) {
                                        setToggle((isToggle) => true);
                                    }
                                } else {
                                    setScore((preScore) => preScore + 1);
                                    setToggle((isToggle) => false);
                                }
                            }
                        }
                    }
                    img.dispose();
                    await tf.nextFrame();
                    // raf = requestAnimationFrame(predict);
                    // console.log(raf)
                } catch (e) {
                    console.error(e);
                    continue;
                }
            }
        };
        predict();
    };

    const startVideo = async () => {
        setBtn((btnVisible) => !btnVisible);

        const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        if (camera && camera.current && !camera.current.srcObject) {
            camera.current.srcObject = stream;
        }

        dictStart();
        run();
    };

    function blobToDataURL(blob, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(blob);
    };

    // audio recorder
    const onStop = (audioData) => {
        console.log('audioData', audioData);

        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = audioData.url;
        a.download = "Jasmine_음성파일.wav";
        a.click();
        window.URL.revokeObjectURL(audioData.url);
        
        let body = {
            userFrom: userFrom,
            createdAt: timestamp,
        };
        
        Axios.post('/api/run/audio', body).then((response) => {
            if (response.data.success) {
            } else {
                alert('Audio error');
            }
        });
    }

    const startAudio = () => {
        setRecordState(RecordState.START);
    }
    const stopAudio = () => {
        setRecordState(RecordState.STOP);
    }

    return (
        <div id="FD">
            <div className="audioRecord" style={{ display: 'none' }}>
                <AudioReactRecorder userFrom={userFrom} state={recordState} onStop={onStop} />
            </div>
            {btnVisible && (
                <ShowButton
                    style={{
                        scale: x.to({
                            range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                            output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
                        }),
                    }}
                    onClick={() => {
                        startAudio();
                        startVideo();
                    }}
                >
                    발표 시작하기
                </ShowButton>
            )}

            {!btnVisible && (
                <div className="facedetector">
                    <video id="webcam" autoPlay muted={true} ref={camera} />
                </div>
            )}

            <animated.img src={sloth} className="animal" id="sloth" style={appearSloth} />
            <animated.div className="text" id="sloth-text" ref={figures} style={appearSlothText} />
            {!btnVisible && <animated.img src={koala} className="animal" id="koala" style={appearKoala} />}
            {!btnVisible && (
                <animated.div className="text" id="koala-text" style={appearKoalaText}>
                    잘하고 있어요👍
                </animated.div>
            )}
            <div className="stopButton">
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <button onClick={stopAudio} type="submit">
                        끝내기
                    </button>
                </form>
            </div>
        </div>
    );
}
export default withRouter(FaceDetector);