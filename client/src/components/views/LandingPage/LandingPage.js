import React, { useEffect } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import '../../../css/bootstrap.min.css';
import './cover.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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

                <div class="site-wrapper">

                    <div class="site-wrapper-inner">

                        <div class="cover-container">
                            <div class="masthead clearfix">
                                <div class="inner">
                                <h3 class="masthead-brand">Cover</h3>
                                <nav>
                                    <ul class="nav masthead-nav">
                                    <li class="active"><a href="#">Home</a></li>
                                    <li><a href="#">Features</a></li>
                                    <li><a href="#">Contact</a></li>
                                    </ul>
                                </nav>
                                </div>
                            </div>

                            <div class="inner cover">
                                <h1 class="cover-heading">Cover your page.</h1>
                                <p class="lead">Cover is a one-page template for building simple and beautiful home pages. Download, edit the text, and add your own fullscreen background photo to make it your own.</p>
                                <p class="lead">
                                <a href="#" class="btn btn-lg btn-default">Learn more</a>
                                </p>
                            </div>

                            <div class="mastfoot">
                                <div class="inner">
                                <p>Cover template for <a href="http://getbootstrap.com">Bootstrap</a>, by <a href="https://twitter.com/mdo">@mdo</a>.</p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </body>
        </html>
    );
        {/*<div class="site-wrapper">
         <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100vh',
            }}
        >
            <h2>시작 페이지</h2>
            <button onClick={onClickHandler}>로그아웃</button>
        </div>*/}
}

export default withRouter(LandingPage);
