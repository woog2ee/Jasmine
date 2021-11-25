import React from 'react';
import axios from 'axios';
import logo from '../../../img/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/Navi.css'
import { withRouter } from 'react-router-dom';

function Navbar(props) {
    const onHomeClickHandler = () => {
        props.history.push('/home');
    };

    const onRegisterClickHandler = () => {
        props.history.push('/register');
    };

    const onLoginClickHandler = () => {
        props.history.push('/login');
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
        <div className="masthead clearfix">
            <div className="inner">
                {/* <h3 class="masthead-brand">Cover</h3> */}
                <div className="logo masthead-brand">
                    <img src = {logo} className="logoImg"/>
                </div>
                <nav>
                    <ul className="nav masthead-nav">
                        <li className="active">
                            <button className="fs-3 li-a" id="list-1" onClick={onHomeClickHandler}>홈</button>
                        </li>
                        <span className='bar'>|</span>
                        <li className="active">
                            <button className="fs-3 li-a" id="list-2" onClick={onRegisterClickHandler}>회원가입</button>
                        </li>
                        <span className='bar'>|</span>
                        <li className="active">
                            <button className="fs-3 li-a" id="list-3" onClick={onLoginClickHandler}>로그인</button>
                        </li>
                        <span className='bar'>|</span>
                        <li className="active">
                        <button className="fs-3 li-a" id="list-3" onClick={onLogoutClickHandler}>로그아웃</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default withRouter(Navbar);
