import React from "react";
import logo from '../../../img/logo.png'
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import '../../../css/RecordingList.css';
import { withRouter } from 'react-router-dom';

const Record = styled.button`
    outline: none;
    border: outset;
    border-radius: 5px;
    cursor: pointer;
    width: 80%;
    height: 90px;
    margin: 1.7rem auto;
    display: flex;

    background: #E7F4F8;
    
    &:hover {
        background: ${lighten(0.05, '#E7F4F8')};
    }
    &:active {
        background: ${darken(0.05, '#E7F4F8')};
    }

`

function RecordingList(props){
    // db에서 recording 가져오기
    const record_list = [['2021.01.01','01:01:01'], ['2021.02.02','02:02:02'], ['2021.03.03','03:03:03'], ['2021.04.04','04:04:04'], ['2021.05.05','05:05:05'], ['2021.06.06','06:06:06'], ['2021.07.07','07:07:07'], ['2021.08.08','08:08:08'], ['2021.09.09','09:09:09'], ['2021.10.10','10:10:10']]
    // axios.get('/api/users/logout').then((response) => {
    //     if (response.data.success) {
    //         props.history.push('/login');
    //     } else {
    //         alert('로그아웃에 실패했습니다.');
    //     }
    // });
    //const record_list = 
    
    const onSubmitHandler = (event) => {
        event.preventDefault();

        props.history.push('/home');
    };

    return(
        <div className='recordingList'>
            <div className="simpleNavi">
                <img src={logo} alt='logo'/>
            </div>
            <div className='list_board'>
                <div className="question">
                    <h1 className='title'>나의 스피치 기록</h1>
                </div>
                <div className='list'>
                    {record_list.map(([date, time], idx) => (
                        <Record type='submit'>
                            <span className='date' id="recording_date">{date}</span>
                            <span className='time' id="recording_time">{time}</span>
                        </Record>
                    ))}
                </div>
                <div className="stopButton">
                    <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                        <button type="submit">끝내기</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default withRouter(RecordingList);