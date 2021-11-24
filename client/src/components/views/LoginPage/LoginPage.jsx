import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../_actions/user_action';
import { withRouter } from 'react-router-dom';
import Navbar from '../NavBar/NavBar';

function LoginPage(props) {
    const dispatch = useDispatch();

    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');

    const onEmailHandler = (event) => {
        setEmail(event.currentTarget.value);
    };

    const onPasswordHandler = (event) => {
        setPassword(event.currentTarget.value);
    };

    const onSubmitHandler = (event) => {
        event.preventDefault();

        let body = {
            email: Email,
            password: Password,
        };

        dispatch(loginUser(body)).then((response) => {
            if (response.payload.loginSuccess) {
                localStorage.setItem('userId', response.payload.userId);
                props.history.push('/');
            } else {
                alert('Error');
            }
        });
    };

    return (
        <body>
            <div
                className="bg-primary bg-opacity-25"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100vh',
                }}
            >
                <Navbar/>
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <div className="row pdB">
                        <label htmlFor="colFormLabelLg" className="col-form-label text-body">이메일</label>
                        <input type="email" className="form-control" value={Email} onChange={onEmailHandler} />
                    </div>
                    <div className="row">
                        <label htmlFor="colFormLabelLg" className="col-form-label text-body">비밀번호</label>
                        <input type="password" className="form-control" value={Password} onChange={onPasswordHandler} />
                    </div>
                    <br />
                    <button type="submit" className="btn btn-primary">로그인</button>
                </form>
            </div>
        </body>
    );
}

export default withRouter(LoginPage);
