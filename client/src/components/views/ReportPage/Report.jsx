import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import atob from 'atob';
import logo from '../../../img/logo.png'
import '../../../css/Report.css'
import wordCloud from '../../../img/wordcloud.png';
import { withRouter } from 'react-router-dom';

function Report(props){
    let userFrom = localStorage.getItem('userId');
    const [vision, setVision] = useState([]);
    const [voice, setVoice] = useState([]);
    const [word, setWord] = useState([]);
    const [img, setImg] = useState();

    const mk_comments = () => {
        let comments = [];
        if (vision['score'] >= 70) {
            comments.push(<><span>{userFrom}(이)의 발표태도가 좋아요.</span><br/></>)
        } else {
            comments.push(<><span>{userFrom}(이)의 고개가 정면을 보고 있도록 도와주세요.</span><br/></>)
        }
        comments.push(<br/>);
        let comment_arr = ['variety_comment','sentcount_comment','keywords_comment',
        'stopwords_comment','countwords_comment']
        comment_arr.forEach((txt) => {
            const tmp = word[txt]
            comments.push(<><span key={txt}>{tmp}</span><br/></>)
        })
        comments.push(<br/>);
        comment_arr = ['slient_cmt','tempo_cmt','volume_cmt']
        comment_arr.forEach((txt) => {
            const tmp = voice[txt]
            comments.push(<><span key={txt}>{tmp}</span><br/></>)
        })
        return comments;
    };

    // const handlingDataForm = async img_tmp => {
    //     const ab = new ArrayBuffer(img_tmp.length);
    //     const ia = new Uint8Array(ab);
    //     for (let i = 0; i < img_tmp.length; i++) {
    //         ia[i] = img_tmp.charCodeAt(i);
    //     }
    //     const blob = new Blob([ia], {
    //         type: "image/png"
    //     });
    //     const file = new File([blob], "image.png");
    //     return file;
    // };

    // function toBase64(arr) {
    //     //arr = new Uint8Array(arr) if it's an ArrayBuffer
    //     return btoa(
    //        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    //     );
    // }

    useEffect(() => {
        axios.get('/api/report/vision', {
            params: {
                userFrom: userFrom,
                timestamp: '2021-11-24T01:09:36.188+00:00'
                // timestamp: props.timestamp
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
                userFrom: userFrom,
                timestamp: '2021-11-24T01:09:36.188+00:00'
                // timestamp: props.timestamp
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 음성 분석을 불러오는 데 실패했습니다.');
            }
            setVoice(response.data.list);
        });

        axios.get('/api/report/word', {
            params: {
                userFrom: userFrom,
                timestamp: '2021-11-24T01:09:36.188+00:00'
                // timestamp: props.timestamp
            },
        }).then((response) => {
            if (response.data.success) {
            } else {
                alert('발표 대본 분석을 불러오는 데 실패했습니다.');
            }
            setWord(response.data.list);
            // setImg("data:image/png;base64,"+toBase64(response.data.list["keywords_img"].data));
            // console.log(response.data.list["keywords_img"]);
        });

        // let tmp = String(word['keywords_image'])
        // img_tmp = atob((tmp).substr(2,));
        // img_tmp = "data:image/png;base64,"+img_tmp;

        
        // fs.writeFile('image.png', img_tmp, {encoding: 'base64'}, function(err) {
        //     console.log('File created');
        // });
        
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
                            <img src='../../../../Jasmine_sentence_count.png' alt='wordcloud'/>
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
                        <span className='mini-title' id='feedback-title'>피드백</span>
                        <div className='feedback-content'>
                            {mk_comments()}
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