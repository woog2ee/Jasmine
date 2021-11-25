import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { withRouter } from 'react-router-dom';

function Loading(props){
    const userFrom = localStorage.getItem('userId');


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