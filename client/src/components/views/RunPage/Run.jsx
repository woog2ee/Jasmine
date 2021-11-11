import React, { useState } from "react";
import logo from '../../../img/logo.png';
import FaceDetector from './FaceDetector';
import Dictaphone from './Dictaphone';
import '../../../css/Run.css';
import AudioRecorder from './AudioRecorder';
import { withRouter } from 'react-router-dom';

function Run(props) {
    const question = '랜덤 질문';
    const [isEnd, setisEnd] = useState(false)

    const onSubmitHandler = (event) => {
        event.preventDefault();
        setisEnd(true);

        props.history.push('/home');
    };

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
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <button type="submit">끝내기</button>
                </form>
            </div>
        </div>
    );
}

export default withRouter(Run);
