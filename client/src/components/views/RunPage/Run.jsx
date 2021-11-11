import React, { useState } from "react";
import logo from '../../../img/logo.png';
import FaceDetector from './FaceDetector';
import Dictaphone from './Dictaphone';
import '../../../css/Run.css';
import AudioRecorder from './AudioRecorder';


function Run() {
    const question = '랜덤 질문'
    const [isEnd, setisEnd] = useState(false)


    return (
        <div className="run">
            <div className="simpleNavi">
                <img src={logo} alt="logo" />
            </div>

            <div className="face">
                <div className="question" id="run_question">
                    <h2>{question}</h2>
                </div>
                <FaceDetector isEnd={isEnd} />
                <Dictaphone />
            </div>
            <div className="stopButton">
                <button onClick={() => setisEnd(true)}>끝내기</button>
            </div>
        </div>
    );
}

export default Run;
