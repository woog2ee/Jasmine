import React from 'react';
import rabbit from '../../../img/rabbit.png';
import { withRouter } from 'react-router-dom';
import { useSpring, config, animated } from 'react-spring';

function Start(props) {

    const onSubmitHandler = (event) => {
        event.preventDefault();
        props.history.push('/run');
    };
    const { x } = useSpring({
        loop: true,
        from: { x: 0 },
        to: { x: 1 },
        config: { duration: 2000 },
    });
    return (
        <div className="start">
            <img className="rabbit" src={rabbit} alt="rabbit"/>
            <form id="homeImg"style={{ display: 'flex', flexDirection: 'column' }} onSubmit={onSubmitHandler}>
                <span>
                    <animated.button type="submit"
                    style={{
                        scale: x.to({
                            range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                            output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
                        }),
                    }}>발표 시작</animated.button>
                </span>
            </form>
        </div>
    );
}

export default withRouter(Start);
