import React from 'react';
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
                            <button className="fs-3 li-a text-body" id="list-1" onClick={onHomeClickHandler}>홈</button>
                        </li>
                        <li className="active">
                            <button className="fs-3 li-a text-body" id="list-2" onClick={onRegisterClickHandler}>회원가입</button>
                        </li>
                        <li className="active">
                            <button className="fs-3 li-a text-body" id="list-3" onClick={onLoginClickHandler}>로그인</button>
                            
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default withRouter(Navbar);
