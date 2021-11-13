/* eslint-disable */
import React, { useState, useRef } from 'react';
import logo from '../../../img/logo.png';
import FaceDetector from './FaceDetector';
import '../../../css/Run.css';
import { withRouter } from 'react-router-dom';

function Run(props) {
    const question = '랜덤 질문';
    //const [isEnd, setisEnd] = useState(false);
    const endRef = useRef({});

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        endRef.current.allStop();
        // await setisEnd(true);

        props.history.push('/finish');
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
                <FaceDetector ref={endRef} />
            </div>
            <div className="stopButton">
                <form style={{ display: 'flex', flexDirection: 'column'}} onSubmit={onSubmitHandler}>
                    <button type="submit">끝내기</button>
                </form>
            </div>
        </div>
    );
}

export default withRouter(Run);
