import React from "react";
import logo from '../../../img/logo.png';
import '../../../css/Home.css';
import Rock from "./Rock";


function Home() {
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