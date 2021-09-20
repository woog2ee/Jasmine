import React from "react";
import logo from './img/logo.png';
import home from './img/home.svg';
import mypage from './img/mypage.svg';
import contact from './img/contact.svg';

import './Navi.css';

function Navi(){
    return(
        <div className="navibar">
            <div className="logo">
                <img src = {logo} className="logoImg"/>
            </div>
            <div className="menu">
                <ul>
                    <li><button><img src={home}/></button></li>
                    <li><button><img src={mypage}/></button></li>
                    <li><button><img src={contact}/></button></li>
                </ul>
            </div>
        </div>
    )
}

export default Navi;