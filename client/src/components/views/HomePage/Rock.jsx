import React from 'react';
import {BrowserRouter, Link, Switch, Route} from 'react-router-dom';
import Run from './../RunPage/Run';

function Rock(props){
    let name = props.name
    let word;
    
    if (name === "Run"){
        word = "발표 시작"
        return(
            <div className="rock" id="run_rock">
                <span>{word}</span>
            </div>
        )
    }
    else if (name === "RecordingList"){
        word = "발표 목록"
        return(
            <div className="rock" id="run_recording">
                <span>{word}</span>
            </div>
        )
    }
}

export default Rock;