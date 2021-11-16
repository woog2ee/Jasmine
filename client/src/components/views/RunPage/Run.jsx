/* eslint-disable */
import React, { useState, useRef } from 'react';
import logo from '../../../img/logo.png';
import FaceDetector from './FaceDetector';
import '../../../css/Run.css';

function Run(props) {
    const question = '랜덤 질문';

    return (
        <div className="run">
            <div className="simpleNavi">
                <img src={logo} alt="logo" />
            </div>

            <div className="face">
                <div className="question" id="run_question">
                    <h2>{question}</h2>
                </div>
                <FaceDetector userFrom={localStorage.getItem('userId')} />
            </div>
        </div>
    );
}

export default Run;
