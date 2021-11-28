import React, { useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/Navi.css'
import { withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { auth } from '../../../_actions/user_action';

function Navbar(props) {
    const [isLogin, setIsLogin] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(auth()).then((response) => {
            if (!response.payload.isAuth) {
                setIsLogin(false);
            } else {
                setIsLogin(true);
            }
        });
    }, [])

    const onHomeClickHandler = () => {
        props.history.push('/');
    };

    const onRegisterClickHandler = () => {
        props.history.push('/register');
    };

    const onLoginClickHandler = () => {
        if (isLogin) {
            axios.get('/api/users/logout').then((response) => {
                if (response.data.success) {
                    alert('로그아웃 되었습니다.');
                    setIsLogin(false);
                } else {
                    alert('로그아웃에 실패했습니다.');
                }
            });
        } else {
            props.history.push('/login');
        }
    };

    return (
        <div className="masthead clearfix">
            <div className="inner">
                {/* <h3 class="masthead-brand">Cover</h3> */}
                <div className="logo masthead-brand">
                    <img src={logo} className="logoImg" />
                </div>
                <nav>
                    <ul className="nav masthead-nav">
                        <li className="active">
                            <button className="fs-3 li-a" id="list-1" onClick={onHomeClickHandler}>
                                홈
                            </button>
                        </li>
                        <span className="bar">|</span>
                        <li className="active">
                            <button className="fs-3 li-a" id="list-2" onClick={onRegisterClickHandler}>
                                회원가입
                            </button>
                        </li>
                        <span className="bar">|</span>
                        <li className="active">
                            <button className="fs-3 li-a" id="list-3" onClick={onLoginClickHandler}>
                                {isLogin ? '로그아웃' : '로그인   '}
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default withRouter(Navbar);
