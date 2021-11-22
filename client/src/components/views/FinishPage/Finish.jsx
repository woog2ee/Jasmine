import React, { useRef, useState } from "react";
import logo from '../../../img/logo.png'
import '../../../css/Report.css'
import miniFlower from '../../../img/mini_flower.png';
import txtBsImg from '../../../img/bear.png';
import { withRouter } from 'react-router-dom';

function Finish(props){
    // const date = props.date;
    // const time = props.time;
    const date = '2021-02-02';
    const time = '23:12';
    const total_comment = "참 잘했어요! 오늘처럼 발표해주세요."
    const flower_cnt = 5;
    const comments = ['abcde','ddddd','aaaaa','kkkkk'];
    //const total_comment = "발표하느라 수고했어요!"
    const mk_flowers = () => {
        let flower_arr = [];
        for(let i=0;i<flower_cnt;i++){
            flower_arr.push(<img src={miniFlower} alt='flower-rate'/>);
        }
        return flower_arr;
    }

    const mk_comments = comments.map((commt) => {
        return (<><span>{commt}</span><br/></>);
    });
    
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
                            {mk_comments}
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