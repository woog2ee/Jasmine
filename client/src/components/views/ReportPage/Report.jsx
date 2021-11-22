import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import '../../../css/Report.css'
import wordCloud from '../../../img/wordcloud.png';
import { withRouter } from 'react-router-dom';

function Report(props){
    const [vision, setVision] = useState([]);
    const [voice, setVoice] = useState([]);
    const [word, setWord] = useState([]);

    useEffect(() => {
        axios.get('/api/report/vision', {
            params: {
                userFrom: localStorage.getItem('userId'),
                timestamp: props.timestamp
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 태도 분석을 불러오는 데 실패했습니다.');
            }
            setVision(response.data.list);
        });

        axios.get('/api/report/voice', {
            params: {
                userFrom: localStorage.getItem('userId'),
                timestamp: props.timestamp
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 음성 분석을 불러오는 데 실패했습니다.');
            }
            setVision(response.data.list);
        });

        axios.get('/api/report/vision', {
            params: {
                userFrom: localStorage.getItem('userId'),
                timestamp: props.timestamp
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 대본 분석을 불러오는 데 실패했습니다.');
            }
            setVision(response.data.list);
        });
    }, []);

    const onSubmitHandler = (event) => {
        event.preventDefault();

        props.history.push('/list');
    };

    return (
        <div className='report'>
            <div className="simpleNavi">
                <img src={logo} alt='logo'/>
            </div>
            <div className='body'>
                
                <div className='content'>
                    <div className="question" id="report_question">
                        <h1 className='title'>Report</h1>   
                        <h2>
                            <span className='date' id="report_date">{props.date}</span>
                            <span className='time' id="report_time">{props.time}</span>
                        </h2>
                    </div>
                    <div className='box' id='box1'>
                        <span className='mini-title'>
                            키워드
                        </span>
                        <div className='wordcloud'>
                            <img src={wordCloud} alt='wordcloud'/>
                            <div className='rank'>
                                <ul>
                                    <li>1위 : </li>
                                    <li>2위 : </li>
                                    <li>3위 : </li>
                                    <li>4위 : </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className='box' id='box2'>
                        <span className='mini-title'>
                            필요 없는 단어
                        </span>
                        <div className='wordcloud'>
                            <img src={wordCloud} alt='wordcloud'/>
                            <div className='rank'>
                                <ul>
                                    <li>1위 : </li>
                                    <li>2위 : </li>
                                    <li>3위 : </li>
                                    <li>4위 : </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='secondrow'>
                        <div className='graph'>
                            그래프
                        </div>
                        <div className='summary'>
                            발표 내용 요약
                        </div>
                    </div>
                    <div className='thirdrow'>
                        <span className='mini-title' id='feedback-title'>자스민이 하고싶은 말</span>
                        <div className='feedback-content'>
                            <span>
                                dklfjsldkfjkldsjfkljsioejfoisdjdflkjds
                            </span>
                            <br/>
                            <span>
                                고개가 왼쪽으로 돌아가니 주의해주세요.
                            </span>
                            <br/>
                            <span>
                                발표할때 목소리에 좀더 힘을 실어서 발표해주세요.
                            </span>
                        </div>
                    </div>
                    <div className='scoreboard'>
                        <div className='totalscore'>총점 : 100점</div>
                        <div className='subscore'>
                            <span id='vision'>시선 : 00점</span>
                            <span id='voice'>목소리 : 00점</span>
                            <span id='contents'>내용 : 00점</span>
                        </div>
                    </div>
                    <div className="stopButton" id="back">
                        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                            <button type="submit">뒤로 가기</button>
                        </form>
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default withRouter(Report);