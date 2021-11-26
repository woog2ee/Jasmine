import React, { useState, useEffect } from "react";
import logo from '../../../img/logo.png';
import '../../../css/Home.css';
import Rock from "./Rock";


function Home() {
    const [flower, setFlower] = useState(0);

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