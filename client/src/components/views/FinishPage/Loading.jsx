import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { withRouter } from 'react-router-dom';

function Loading(props){
    const userFrom = localStorage.getItem('userId');
    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
    useEffect(() => {
        sleep(100000).then(() => {
            axios.post('/api/report/voiceandword');
            console.log("제발~~");
        }).then(() => sleep(100000).then(() => props.history.push('/finish')));
    })

    return (
        <div className='report'>
            <div class="d-flex align-items-center">
                <strong>Loading...</strong>
                <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
            </div>
        </div>
    )
}

export default withRouter(Loading);