import React, { useEffect } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import './cover.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Foot from '../Footer/Footer';
import Navbar from '../NavBar/NavBar';

function LandingPage(props) {
    useEffect(() => {
        axios.get('/api/hello').then((response) => {
            console.log(response.data);
        });
    }, []);

    const onClickHandler = () => {
        axios.get('/api/users/logout').then((response) => {
            if (response.data.success) {
                props.history.push('/login');
            } else {
                alert('로그아웃에 실패했습니다.');
            }
        });
    };

    return (
        <html lang="en">
            <body>
                <div class="site-wrapper bg-primary bg-opacity-25">
                    <div class="site-wrapper-inner">
                        <div class="cover-container">
                            <Navbar/>
                            <div class="inner cover">
                                <h1 class="cover-heading">Cover your page.</h1>
                                <p class="lead">
                                    Cover is a one-page template for building simple and beautiful home pages. Download, edit the text, and
                                    add your own fullscreen background photo to make it your own.
                                </p>
                                <p class="lead">
                                    <a href="#" class="btn btn-lg btn-default">
                                        Learn more
                                    </a>
                                </p>
                                <button onClick={onClickHandler}>로그아웃</button>
                            </div>
                            <Foot/>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

export default withRouter(LandingPage);
