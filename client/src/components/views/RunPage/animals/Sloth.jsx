import React, { useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import sloth from '../../../../img/sloth.svg'

const Sloth = (props) => {
    const appear = useSpring({
        x: props.isToggled ? 200:-100,
    })
    return (
        <div>
            <animated.img src={sloth} style={appear}/>
        </div>
    )
}
export default Sloth;