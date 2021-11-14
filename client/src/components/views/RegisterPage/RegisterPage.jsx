import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../_actions/user_action';
import { withRouter } from 'react-router-dom';

function RegisterPage(props) {
    const dispatch = useDispatch();

    const [Email, setEmail] = useState('');
    const [Name, setName] = useState('');
    const [Password, setPassword] = useState('');
    const [ConfirmPassword, setConfirmPassword] = useState('');

    const onEmailHandler = (event) => {
        setEmail(event.currentTarget.value);
    };

    const onNameHandler = (event) => {
        setName(event.currentTarget.value);
    };

    const onPasswordHandler = (event) => {
        setPassword(event.currentTarget.value);
    };

    const onConfirmPasswordHandler = (event) => {
        setConfirmPassword(event.currentTarget.value);
    };

    const onSubmitHandler = (event) => {
        event.preventDefault();

        if (Password !== ConfirmPassword) {
            return alert('비밀번호와 비밀번호 확인은 같아야 합니다.');
        }

        let body = {
            email: Email,
            name: Name,
            password: Password,
        };

        dispatch(registerUser(body)).then((response) => {
            if (response.payload.success) {
                props.history.push('/login');
            } else {
                alert('Failed to sign up');
            }
        });
    };

    return (
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
            <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                <div className="row">
                    <label htmlFor="colFormLabelLg" className="col-form-label">Email</label>
                    <input type="email" className="form-control" value={Email} onChange={onEmailHandler} />
                </div>
                <div className="row">
                    <label htmlFor="colFormLabelLg" className="col-form-label">Name</label>
                    <input type="text" className="form-control" value={Name} onChange={onNameHandler} />
                </div>
                <div className="row">
                    <label htmlFor="colFormLabelLg" className="col-form-label">Password</label>
                    <input type="password" className="form-control" value={Password} onChange={onPasswordHandler} />
                </div>
                <div className="row">
                    <label htmlFor="colFormLabelLg" className="col-form-label">Confirm Password</label>
                    <input type="password" className="form-control" value={ConfirmPassword} onChange={onConfirmPasswordHandler} />
                </div>
                <br />
                <button type="submit" className="btn btn-outline-primary">회원 가입</button>
            </form>
        </div>
    );
}

export default withRouter(RegisterPage);
