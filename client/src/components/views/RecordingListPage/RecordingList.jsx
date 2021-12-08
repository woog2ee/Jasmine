import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../../../img/logo.png';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import '../../../css/RecordingList.css';
import { withRouter } from 'react-router-dom';
import { useHistory } from 'react-router';

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
    const [recordTimeList, setRecordTimeList] = useState([]);

    useEffect(() => {
        axios.get('/api/report/list', {
            params: {
                userFrom: localStorage.getItem('userId')
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 기록을 불러오는 데 실패했습니다.');
            }
            for (var i = 0; i < response.data.list.length; i++) {
                var temp = (' ' + response.data.list[i]["createdAt"]).slice(1);
                console.log(temp);
                setRecordTimeList(list => [...list, temp]);
            }
        });
    }, []);

    const onSubmitHandler = (event) => {
        event.preventDefault();
        
        props.history.push('/home');
    };

    const onReportHandler = (event, datetime) => {
        event.preventDefault();

        const history = useHistory();
        history.push({
            pathname: '/loading',
            state: {
                date: timestamp,
                userFrom: localStorage.getItem('userId')
            }
        });
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
                    {recordTimeList?.map((datetime,idx) => (
                        <form key={idx} onSubmit={onReportHandler(datetime)}>
                            <Record type="submit" datetime={datetime}>
                                <span className="date" id="recording_date">
                                    {datetime.substring(0, 10)}
                                </span>
                                <span className="time" id="recording_time">
                                    {datetime.substring(11, 19)}
                                </span>
                            </Record>
                        </form>
                    ))}
                </div>
                <div className="stopButton" id="end">
                    <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                        <button type="submit">끝내기</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default withRouter(RecordingList);
