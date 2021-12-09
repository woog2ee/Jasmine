import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import Jasmine from '../../../img/Jasmine.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { withRouter } from 'react-router-dom';

function Loading(props){
    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
    useEffect(() => {
        sleep(3000) // DB 저장 시간
            .then(() => {
                console.log('제발~~');
                axios.post('/api/report/voiceandword');
            })
            .then(() =>
                sleep(60000).then(() => // 발표 분석 시간
                    props.history.push({
                        pathname: '/finish',
                        state: {
                            date: props.location.state.date,
                            userFrom: props.location.state.userFrom
                        }
                    })
                )
            );
    },[])

    return (
        <div className='report'>
            <div className="simpleNavi" style={{marginLeft:'2vw'}}>
                <img src={logo} alt="logo" />
            </div>
            <div className="justify-content-center">
                <div style={{width:'100vw'}}>
                    <div className="spinner-border text-light" style={{width:'20rem', height: '20rem',margin:'9% auto 0 45%'}} role="status">
                    </div>
                </div>
                <div style={{width:'100%'}}>
                    <div style={{margin:'0 37%'}}>
                        <img src={Jasmine} alt="jasmine" style={{width: '10rem', height: '10rem'}}/>
                        <span className="text-light" style={{marginLeft:'2rem',fontSize: '30px',fontWeight: '250',fontFamily: 'HSYuji-Regular'}}>잠시만 기다려주세요.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withRouter(Loading);