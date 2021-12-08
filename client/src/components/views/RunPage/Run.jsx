/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import logo from '../../../img/logo.png';
import FaceDetector from './FaceDetector';
import '../../../css/Run.css';
import { set } from 'mongoose';

function Run(props) {
    const [Title,setTitle] = useState('');
    const [isTitle,setIsTitle] = useState(false);
    const handleChange = ({target : {value} }) => setTitle(value);
    const handleSubmit = (e)=> {
        e.preventDefault();
        setTitle('구름은 무슨 맛일까?');
    }
    return (
        <div className="run">
            <div className="simpleNavi">
                <img src={logo} alt="logo" />
            </div>

            <div className="face">
                <div className="question" id="run_question">
                    <h2>{Title}</h2>
                </div>
                <div style={{height:'200px'}}>
                    {!isTitle && <div className="form" style={{width:'100%'}}>
                        <input className="form-control" 
                        style={{width:'400px',height:'60px',fontSize:'30px' ,margin:'10px auto'}}
                        type="text" 
                        placeholder="발표 주제를 입력해주세요."
                        value={Title}
                        onChange={handleChange}/>
                        
                        <form onSubmit={handleSubmit} 
                            style={{width:'120px',height:'20px', margin:'auto'}}
                        >
                            <div className='btn-group' role='group'>
                                <button type="submit" className="btn btn-default">추천</button>
                                <button 
                                    // style={{width:'100px',height:'35px',margin:'-20px auto 0 400px'}}
                                    className="btn btn-default"
                                    onClick={
                                        () => {
                                            setIsTitle(true);
                                        }
                                    }>
                                    완료
                                </button>
                            </div>
                        </form>
                    </div>}
                </div>
                <FaceDetector userFrom={localStorage.getItem('userId')} />
            </div>
        </div>
    );
}

export default Run;
