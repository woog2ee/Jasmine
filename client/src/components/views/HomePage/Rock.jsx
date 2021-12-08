import React from 'react';
import { withRouter } from 'react-router-dom';

function Rock(props) {

    const onSubmitHandler = (event) => {
        event.preventDefault();
        props.history.push('/list');
    };
    return (
        <div className="rock" id="run_recording">
            <form style={{ display: 'flex', flexDirection: 'column'}} onSubmit={onSubmitHandler}>
                <span>
                    <button className="rockButton" type="submit">우리아이<br/>발표결과</button>
                </span>
            </form>
        </div>
    );
}

export default withRouter(Rock);
