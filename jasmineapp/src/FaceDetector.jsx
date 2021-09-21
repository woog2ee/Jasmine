import React, { useRef } from "react";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs'

// canvas 추가 시 찾은 얼굴 redbox 표시가능
const FaceDetector = () => {
    let model;
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

            for (let i = 0; i < predictions.length; i++) {
                // const start = predictions[i].topLeft;
                // const end = predictions[i].bottomRight;
                // const size = [end[0] - start[0], end[1] - start[1]];

                // Render a rectangle over each detected face.
                // ctx.fillRect(start[0], start[1], size[0], size[1]);

                if(figures.current){
                    if (predictions[i].probability[0] > 0.5) {
                        figures.current.innerText = String(predictions[i].probability[0]).substring(0,5);
                        // figures.current.innerText = 'success';
                    }
                    else{
                        figures.current.innerText = 'No';
                    }
                }
            }

            if(figures.current){
                figures.current.innerText = '얼굴을 보여주세요';
            }
            img.dispose();
            await tf.nextFrame();
        }
    };

    React.useEffect(() => {
        run();
    })

    return (
        <div className='facedetector'>
            <div className='test' ref={figures}></div>
            <video autoPlay playsInline muted={true} ref={camera}
            width="640" height="480"/>
        </div>
    );
};
export default FaceDetector;