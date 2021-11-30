import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import '../../../css/landingPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Foot from '../Footer/Footer';
import Navbar from '../NavBar/NavBar';
import LandingImg from '../../../img/land2.png'

function LandingPage(props) {

    const onStartClickHandler = () => {
        props.history.push('/home');
    };

    return (
        <div id="htmlID">
            <div className="bg-primary bg-opacity-25" id="bodyID" >
                <div className="site-wrapper ">
                    <div className="site-wrapper-inner">
                        <div className="cover-container">
                            <Navbar />
                            <div className="inner cover">
                                <span className="title-land">
                                    아이들의 자신감 비타민,<br/>AI 자스민.
                                </span>
                                <span className="title-land-mini">
                                    우리 아이의 자신감있는 스피치를 위해 지금 바로 시작해보세요.
                                </span>
                                <img className="testImg" src={LandingImg}/>
                                <p>
                                    <button className="btn btn-lg btn-default startBtn" onClick={onStartClickHandler}>
                                        시작하기
                                    </button>
                                </p>
                            </div>
                            <Foot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(LandingPage);
