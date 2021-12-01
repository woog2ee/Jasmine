import React, { useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png';
import '../../../css/Home.css';
import Rock from "./Rock";
import miniFlower from '../../../img/mini_flower.png';

import Start from "./Start.jsx";


function Home() {
    let userFrom = localStorage.getItem('userId');
    const [flower, setFlower] = useState(0);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        let c = true;
        const getData = () => {
            axios
                .get('/api/report/user', {
                    params: {
                        userFrom: userFrom,
                    },
                })
                .then((response) => {
                    if (response.data.success) {
                    } else {
                        alert('사용자 정보를 불러오는 데 실패했습니다.');
                    }
                    if (c) {
                        c = false;
                        setFlower(() => response.data.user['flower']);
                        setUserName(response.data.user['name']);
                    }
                });
        };
        getData();
        return () => {
            c = false;
        };
    }, []);

    return (
        <div className="main_board">
            <div className="simpleNavi" id="homeLogo">
                <img src={logo} alt="logo" />
                <div className="userFlower">
                    <span>{userName}님</span>
                    <img src={miniFlower} alt="flower"/>
                    <span>:</span>
                    <span>{flower}</span>
                </div>
            </div>
            <Start/>
            <Rock/>
            
        </div>
    );
}

export default Home;