import React, { useEffect } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import './cover.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Foot from '../Footer/Footer';
import Navbar from '../NavBar/NavBar';

function LandingPage(props) {

    const onHomeClickHandler = () => {
        props.history.push('/home');
    };

    const onLogoutClickHandler = () => {
        axios.get('/api/users/logout').then((response) => {
            if (response.data.success) {
                props.history.push('/login');
            } else {
                alert('로그아웃에 실패했습니다.');
            }
        });
    };

    return (
        <div id="htmlID">
            <div className="bg-primary bg-opacity-25" id="bodyID" >
                <div className="site-wrapper ">
                    <div className="site-wrapper-inner">
                        <div className="cover-container">
                            <Navbar />
                            <div className="inner cover">
                                <h1 className="cover-heading">Cover your page.</h1>
                                <p className="lead">
                                    Cover is a one-page template for building simple and beautiful home pages. Download, edit the text, and
                                    add your own fullscreen background photo to make it your own.
                                </p>
                                <p className="lead">
                                    <button className="btn btn-lg btn-default" onClick={onHomeClickHandler}>
                                        시작하기
                                    </button>
                                </p>
                                <button onClick={onLogoutClickHandler}>로그아웃</button>
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
