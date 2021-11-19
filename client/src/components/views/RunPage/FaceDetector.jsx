import React, { useRef, useState} from 'react';
import { useSpring,useTransition, animated } from 'react-spring';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import gaze from 'gaze-detection';
import AudioRecorder from './AudioRecorder';
import sloth from '../../../img/sloth256.png';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';


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
function FaceDetector(props) {
    
    const userFrom = props.userFrom;
    const [recordState, setRecordState] = useState(null);
    const [btnVisible, setBtn] = useState(true);
    const camera = React.useRef();
    const camera_temp = React.useRef();
    const figures = React.useRef();
    const webcamElement = camera.current;
    const [score, setScore] = useState(50);
    const [comment, setComment] = useState('');
    const [isToggle, setToggle] = useState(false);

    const appear = useSpring({
        opacity: isToggle ? 1 : 0,
        marginRight: isToggle ? -500 : -900,
        marginTop: isToggle ? -100 : -500,
    });

    const allStop = async () => {
        console.log('end~~~');
        // stop dictaphone
        dictStop();
        camera.current = null;
        camera_temp.current = null;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // if (score > 100) {
        //     setScore(100);
        // } else if (score < 0) {
        //     setScore(0);
        // }

        // if (score < 70) {
        //     setComment('다음에는 앞을 많이 바라보며 발표해볼까요?');
        // } else {
        //     setComment('앞을 잘 쳐다보고 발표했어요.');
        // }
        // console.log(score);

        // const date = moment().format('YYYY-MM-DD HH:mm:ss');
        let body = {
            userFrom: userFrom,
            score: score,
            comment: comment,
        };

        allStop();

        Axios.post('/api/run/vision', body).then((response) => {
            if (response.data.success) {
                props.history.push('/finish');
            } else {
                alert('Vision error');
            }
        });
    };

    // dictaphone
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
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

    const run = async () => {
        const model = await blazeface.load();
        await gaze.loadModel();

        const webcam = await tf.data.webcam(webcamElement, {
            resizeWidth: 220,
            resizeHeight: 227,
        });

        await gaze.setUpCamera(camera_temp.current);

        while (true) {
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
                        if (gazePrediction === 'LEFT' || gazePrediction === 'RIGHT') {
                            setScore((preScore) => preScore - 1);
                        } else if (gazePrediction === 'STRAIGHT' || gazePrediction === 'TOP' || gazePrediction === 'BOTTOM') {
                            setScore((preScore) => preScore + 1);
                        }
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
                                setScore((preScore) => preScore - 1);
                                //setToggle((isToggle) => true);
                                if (!isToggle){setToggle((isToggle) => true);}
                            } else {
                                setScore((preScore) => preScore + 1);
                                setToggle((isToggle) => false);
                                //if (isToggle){setToggle((isToggle) => false);}
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
    

    const startVideo = async () => {
        setBtn((btnVisible) => !btnVisible);
        
        const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        if (camera && camera.current && !camera.current.srcObject) {
            camera.current.srcObject = stream;
        }
        if (camera_temp && camera_temp.current && !camera_temp.current.srcObject) {
            camera_temp.current.srcObject = stream;
        }

        dictStart();
        run();
    };

    // audio recorder
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

    const startAudio = () => {
        console.log('시작')
        setRecordState(RecordState.START);
    };
    const stopAudio = () => {
        setRecordState(RecordState.STOP);
    };

    return (
        <>
            <div className="audioRecord" style={{display:'none'}}>
                <AudioReactRecorder state={recordState} onStop={onStop} />
            </div>
            {/* <div >
                <AudioRecorder userFrom={userFrom} ref={recordRef}/>
            </div> */}
            
            {/* {btnVisible && <ShowButton
                onClick={() => {
                    startAudio();
                    startVideo();
                }}
            >시작하기
            </ShowButton>} */}
            <ShowButton
                onClick={() => {
                    startAudio();
                    startVideo();
                }}
            >시작하기
            </ShowButton>
            
            {!btnVisible && isToggle &&
                <animated.img src={sloth} style={appear}/>}
            {!btnVisible && 
            <div className="facedetector">
                <div className="test" ref={figures}></div>
                <video id="webcam" autoPlay muted={true} ref={camera} />
                <video id="hiddencam" autoPlay muted={true} ref={camera_temp} />
            </div>
            }
            <div className="stopButton">
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <button onClick={stopAudio} type="submit">
                        끝내기
                    </button>
                </form>
            </div>
        </>
    );
}
export default withRouter(FaceDetector);
