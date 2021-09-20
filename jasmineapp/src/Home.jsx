import React from "react";
import testImg from './img/test.png';
import './Home.css';

function Home(){
    return(
        <div className="home">
            <img className="testImg" src={testImg}/>
            <div className="about">
                <h3>자신감을 불어넣는 스피치 비타민</h3>
                <h2>지금 바로 시작해보세요!</h2>
            </div>
            <div>
                <button>Get Started</button>
            </div>
        </div>
    )
}

export default Home;