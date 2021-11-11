import React from 'react';
import { withRouter } from 'react-router-dom';

function Rock(props) {
    let name = props.name;
    let word;

    const onSubmitHandler = (event) => {
        event.preventDefault();

        if (name === 'Run') {
            props.history.push('/run');
        } else {
            props.history.push('/list');
        }
    };

    if (name === 'Run') {
        word = '발표 시작';
        return (
            <div className="rock" id="run_rock">
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <span>
                        <button type="submit">{word}</button>
                    </span>
                </form>
            </div>
        );
    } else if (name === 'RecordingList') {
        word = '발표 목록';
        return (
            <div className="rock" id="run_recording">
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                    <span>
                        <button type="submit">{word}</button>
                    </span>
                </form>
            </div>
        );
    }
}

export default withRouter(Rock);
