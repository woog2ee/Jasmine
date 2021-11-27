import React, { useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png';
import '../../../css/Home.css';
import Rock from "./Rock";


function Home() {
    let userFrom = localStorage.getItem('userId');
    const [flower, setFlower] = useState(0);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        axios.get('/api/report/user', {
            params: {
                userFrom: userFrom
            }
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('사용자 정보를 불러오는 데 실패했습니다.');
            }
            setFlower((preFlower) => preFlower + response.data.user["flower"]);
            setUserName(response.data.user["name"]);
        })
    })

    return (
        <div className="main_board">
            <div className="simpleNavi">
                <img src={logo} alt="logo" />
            </div>
            <Rock name="RecordingList" />
            <Rock name="Run" />
        </div>
    );
}

export default Home;