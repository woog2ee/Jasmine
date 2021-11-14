import React from 'react';
import logo from '../../../img/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/Navi.css'

function Navbar() {
    return (
        <div class="masthead clearfix">
            <div class="inner">
                {/* <h3 class="masthead-brand">Cover</h3> */}
                <div className="logo masthead-brand">
                    <img src = {logo} className="logoImg"/>
                </div>
                <nav>
                    <ul class="nav masthead-nav">
                        <li class="active">
                            <a href="#" className="fs-3 li-a" id="list-1">홈</a>
                        </li>
                        <li class="active">
                            <a href="#" className="fs-3 li-a" id="list-2">회원가입</a>
                            
                        </li>
                        <li class="active">
                            <a href="#" className="fs-3 li-a" id="list-3">로그인</a>
                            
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;
