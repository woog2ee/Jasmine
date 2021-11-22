import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import logo from '../../../img/logo.png'
import '../../../css/Report.css'
import miniFlower from '../../../img/mini_flower.png';
import txtBsImg from '../../../img/bear.png';
import { withRouter } from 'react-router-dom';

function Finish(props){
    const [vision, setVision] = useState([]);
    const [voice, setVoice] = useState([]);
    const [word, setWord] = useState([]);

    // const date = props.date;
    // const time = props.time;
    const date = '2021-02-02';
    const time = '23:12';
    let total_comment = "참 잘했어요! 오늘처럼 발표해주세요.";
    const flower_cnt = 5;
    
    //const total_comment = "발표하느라 수고했어요!"
    const mk_flowers = () => {
        let flower_arr = [];
        for(let i=0;i<flower_cnt;i++){
            flower_arr.push(<img src={miniFlower} alt='flower-rate'/>);
        }
        return flower_arr;
    }

    const mk_comments = () => {
        let comments = [];
        if (vision['score'] >=70){
            comments.push(<><span>우와~ 오늘 정말 발표태도가 좋아요!<br/>눈과 고개를 앞으로 향해서 잘 발표했어요.</span><br/></>)
        }else{
            comments.push(<><span>발표하는 모습이 멋있어요!<br/>다음에는 앞을 많이 쳐다보면 더욱 좋을 것 같아요</span><br/></>)
        }
        comments.push(<><span>{voice['comment']}</span><br/></>)
        comments.push(<><span>{word['comment']}</span><br/></>)
        // comments.map((commt) => {
        //     return (<><span>{commt}</span><br/></>);
        return comments;
    };

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
            setVoice(response.data.list);
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
            setWord(response.data.list);
        });


        total_comment = ""
    }, []);

    const onSubmitHandler = (event) => {
        event.preventDefault();
        props.history.push('/home');
    };

    return (
        <div className='report'>
            <div className="simpleNavi">
                <img src={logo} alt='logo'/>
            </div>
            <div className='body'>
                <div className='content'>
                    <div className="question" id="report_question">
                        <h1 className='title'>오늘도 수고했어요~</h1>
                    </div>
                    <div className='finish-box'>
                        <span className='finish-span'>
                            {total_comment}
                        </span>
                        <div className='flower-rate'>
                            {mk_flowers()}
                        </div>
                    </div>
                    <div className='thirdrow third-finish'>
                        <span className='finish-span' id='feedback-title'><img src={txtBsImg} />자스민이 하고싶은 말</span>
                        <div className='feedback-content finish-feedback-content'>
                            {mk_comments()}
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

export default withRouter(Finish);