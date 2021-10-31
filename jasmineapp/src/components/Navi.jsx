import React from "react";
import logo from '../img/logo.png';
import home from '../img/home.svg';
import mypage from '../img/mypage.svg';
import contact from '../img/contact.svg';

import '../css/Navi.css';

function Navi(){
    return(
        <div className="navibar">
            <div className="logo">
                <img src = {logo} className="logoImg"/>
            </div>
            <div className="menu">
                <ul>
                    <li><button><img src={home} alt='home'/></button></li>
                    <li><button><img src={mypage} alt='mypage'/></button></li>
                    <li><button><img src={contact} alt='contact'/></button></li>
                </ul>
            </div>
        </div>
    )
}

export default Navi;