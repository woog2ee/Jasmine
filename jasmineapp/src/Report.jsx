import React, { useRef, useState } from "react";
import Navi from "./Navi";
import './css/Report.css'
import wordCloud from './img/wordcloud.png';

function Report(props){

    return (
        <div className='report'>
            {/* <Navi/> */}
            
            <div className='body'>
                
                <div className='content'>
                    <div className="question">
                        <h1 className='title'>Report</h1>   
                        <h2>
                            <span className='date'>{props.date}</span>
                            <span className='time'>{props.time}</span>
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
                </div>
            </div>
        </div>
    )
}

export default Report;