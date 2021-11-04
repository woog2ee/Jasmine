import React from "react";
import logo from './img/logo.png'
import FaceDetector from "./FaceDetector";
import RTresult from "./RTresult";
import Dictaphone from './Dictaphone';
import './css/Run.css';
import AudioRecorder from "./AudioRecorder";
import AudioRecord from "./AudioRecord";

function Run() {
    const question = '랜덤 질문';
    
    return(
        <div className='run'>
            <div className="simpleNavi">
                <img src={logo} alt='logo'/>
            </div>
            <div className="question">
                <h2>{question}</h2>
            </div>
            <div className="face">
                <FaceDetector />
                <RTresult/>
                <AudioRecorder/>
                <Dictaphone />
                <div id="stopButton">
                    <button >끝내기</button>
                </div>
            </div>
        </div>
    )
}

export default Run;