import React, { useState } from 'react';
import axios from 'axios';
import logo from '../../../img/logo.png';
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

    background: #e7f4f8;

    &:hover {
        background: ${lighten(0.05, '#E7F4F8')};
    }
    &:active {
        background: ${darken(0.05, '#E7F4F8')};
    }
`;

function RecordingList(props) {
    // db에서 recording 가져오기
    //const record_list = [['2021.01.01','01:01:01'], ['2021.02.02','02:02:02'], ['2021.03.03','03:03:03'], ['2021.04.04','04:04:04'], ['2021.05.05','05:05:05'], ['2021.06.06','06:06:06'], ['2021.07.07','07:07:07'], ['2021.08.08','08:08:08'], ['2021.09.09','09:09:09'], ['2021.10.10','10:10:10']]
    const [recordList, setRecordList] = useState([]);

    let body = {
        userFrom: localStorage.getItem('userId'),
    };

    axios.get('/api/report/list', body).then((response) => {
        if (response.data.success) {
        } else {
            alert('발표 기록을 불러오는 데 실패했습니다.');
        }
        setRecordList(response.data.list);
        console.log(response.data);
    });

    const onSubmitHandler = (event) => {
        event.preventDefault();

        props.history.push('/home');
    };

    return (
        <div className="recordingList">
            <div className="simpleNavi">
                <img src={logo} alt="logo" />
            </div>
            <div className="list_board">
                <div className="question">
                    <h1 className="title">나의 스피치 기록</h1>
                </div>
                <div className="list">
                    {recordList?.map(([date, time], idx) => (
                        <Record type="submit">
                            <span className="date" id="recording_date">
                                {date}
                            </span>
                            <span className="time" id="recording_time">
                                {time}
                            </span>
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
    );
}

export default withRouter(RecordingList);
