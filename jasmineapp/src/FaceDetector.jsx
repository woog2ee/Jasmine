import React, { useRef, useState } from "react";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs'
import testImg from './img/test.png';
import styled from 'styled-components';
import { darken, lighten } from 'polished';

const CONSTRAINTS = { video: true };

const ShowButton = styled.button`
    outline: none;
    border: none;
    border-radius: 4px;
    color: white;
    font-weight: bold;
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
const FaceDetector = () => {
    let model;
    const [click,setClick] = useState(false);
    const camera = React.useRef();
    const figures = React.useRef();
    const webcamElement = camera.current;

    const run = async () => {
        model = await blazeface.load();

        const webcam = await tf.data.webcam(webcamElement, {
            resizeWidth: 220,
            resizeHeight: 227,
        });

        while (true) {
            // let ctx = camera.getContext('2d');
            const img = await webcam.capture();
            const predictions = await model.estimateFaces(img)
            let check = false;

            for (let i = 0; i < predictions.length; i++) {
                // const start = predictions[i].topLeft;
                // const end = predictions[i].bottomRight;
                // const size = [end[0] - start[0], end[1] - start[1]];

                // Render a rectangle over each detected face.
                // ctx.fillRect(start[0], start[1], size[0], size[1]);

                if(figures.current){
                    figures.current.innerText = String(predictions[i].probability[0]).substring(0,5);
                    check=true
                }
            }
            if(figures.current && !check){
                figures.current.innerText = '얼굴을 보여주세요';
            }
            img.dispose();
            await tf.nextFrame();
        }
    };

    const startVideo = async () => {
        setClick(true);

        const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        if (camera && camera.current && !camera.current.srcObject) {
            camera.current.srcObject = stream;
        }
    }

    React.useEffect(() => {
        run();
    })
    if (click==false){
        return(
            <>
                <ShowButton onClick={startVideo}> 시작하기</ShowButton>
            </>
        )
    }
    else{
        return (
            <div className='facedetector'>
                <div className='test' ref={figures}></div>
                <video autoPlay muted={true} ref={camera} width="640" height="480" poster={testImg}/>
            </div>
        );
    }
    
};
export default FaceDetector;