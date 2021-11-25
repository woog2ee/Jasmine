import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import './cover.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Foot from '../Footer/Footer';
import Navbar from '../NavBar/NavBar';
import LandingImg from '../../../img/landing.png'

function LandingPage(props) {

    const onHomeClickHandler = () => {
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
                                <img className="testImg" src={LandingImg}/>
                                <p className="lead">
                                    아이들의 자신감 비타민,<br/>자스민.
                                </p>
                                <p className="lead">
                                    <button className="btn btn-lg btn-default" onClick={onHomeClickHandler}>
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
