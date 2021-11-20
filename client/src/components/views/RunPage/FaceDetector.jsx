import React, { useRef, useState} from 'react';
import { useSpring,config, animated } from 'react-spring';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import gaze from 'gaze-detection';
import sloth from '../../../img/sloth512.png';
import koala from '../../../img/koala512.png';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';



const CONSTRAINTS = { video: true };
const ShowButton = styled(animated.button)`
        outline: none;
        border: none;
        border-radius: 10px;
        color: white;
        width: 300px;
        padding: 2rem;
        height: 30%;
        margin: 8% auto;
        font-size: 30px;
        cursor: pointer;
        font-family: 'CookieRunOTF-Bold';
        

        /* 색상 */
        background: #C54AC7;
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
    const camera_temp = React.useRef();
    const figures = React.useRef();
    const webcamElement = camera.current;
    const [score, setScore] = useState(50);
    const [comment, setComment] = useState('');
    const [isToggle, setToggle] = useState(false);

    const appearSloth = useSpring({
        config: config.stiff,
        x : 300,
        opacity: isToggle ? 1 : 0,
        y: -150,
    });
    const appearSlothText = useSpring({
        config: config.stiff,
        x : 150,
        opacity: isToggle ? 1 : 0,
        y: 0,
    });
    const appearKoala = useSpring({
        config: config.stiff ,
        x : -740,
        opacity: isToggle ? 0 : 1,
        y: 270,
    });
    const appearKoalaText = useSpring({
        config: config.stiff,
        x : -350,
        opacity: isToggle ? 0 : 1,
        y: 170,
    });


    const { x } = useSpring({
        loop: true,
        from: { x: 0 },
        to: { x: 1 },
        config: { duration: 2000 },
    })

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
        SpeechRecognition.startListening({ continuous: true});
        if (!browserSupportsSpeechRecognition) {
            return <span>브라우저가 음성인식을 지원하지 않습니다.</span>;
        }
    };
    const dictStop = () => {
        SpeechRecognition.stopListening();
        console.log({ transcript });
        // mongoDB 저장
        let body = {
            userFrom: userFrom,
            text: transcript,
        };

        Axios.post('/api/run/speechtext', body).then((response) => {
            if (response.data.success) {
            } else {
                alert('Speechtext error');
            }
        });

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
                        // figures.current.innerText = String(predictions[i].probability[0]).substring(0, 5);
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
                    if (!isToggle){setToggle((isToggle) => true);}
                    figures.current.innerText = '         얼굴을 보여주세요.';
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
        console.log(audioData.blob);

        let body = {
            userFrom: userFrom,
            audioUrl: audioData.blob,
        };

        Axios.post('/api/run/voice', body).then((response) => {
            if (response.data.success) {
            } else {
                alert('Voice error');
            }
        });
    };

    const startAudio = () => {
        setRecordState(RecordState.START);
    };
    const stopAudio = () => {
        setRecordState(RecordState.STOP);
    };

    return (
        <div id="FD">
            <div className="audioRecord" style={{display:'none'}}>
                <AudioReactRecorder state={recordState} onStop={onStop} />
            </div>
            {btnVisible && <ShowButton
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
            >발표 시작하기
            </ShowButton>}
            
            {!btnVisible && 
            <div className="facedetector">
                <video id="webcam" autoPlay muted={true} ref={camera} />
                <video id="hiddencam" autoPlay muted={true} ref={camera_temp} />
            </div>
            }
        
            
            <animated.img src={sloth} className="animal" id="sloth" style={appearSloth}/>
            
            <animated.div className="text" id="sloth-text" ref={figures} style={appearSlothText}/>
            {!btnVisible && 
            <animated.img src={koala} className="animal" id="koala" style={appearKoala}/>}
            {!btnVisible && 
            <animated.div className="text" id="koala-text" style={appearKoalaText}>잘하고 있어요👍</animated.div>}
            
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
