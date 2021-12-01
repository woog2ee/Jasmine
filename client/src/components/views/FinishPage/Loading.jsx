import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import Jasmine from '../../../img/Jasmine.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { withRouter } from 'react-router-dom';

function Loading(props){
    const userFrom = localStorage.getItem('userId');

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
    useEffect(() => {
        sleep(1000).then(() => {
            //axios.post('/api/report/voiceandword');
            // console.log("제발~~");
        }).then(() => sleep(1000).then(() => props.history.push('/finish')));
    })

    return (
        <div className='report'>
            <div className="simpleNavi" style={{marginLeft:'2vw'}}>
                <img src={logo} alt="logo" />
            </div>
            <div class="justify-content-center">
                <div style={{width:'100vw'}}>
                    <div class="spinner-border text-light" style={{width:'20rem', height: '20rem',margin:'9% auto 0 45%'}} role="status">
                    </div>
                </div>
                <div style={{width:'100%'}}>
                    <div style={{margin:'0 40%'}}>
                        <img src={Jasmine} alt="jasmine" style={{width: '10rem', height: '10rem'}}/>
                        <span className="text-light" style={{marginLeft:'2rem',fontSize: '30px',fontWeight: '250',fontFamily: 'HSYuji-Regular'}}>Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withRouter(Loading);