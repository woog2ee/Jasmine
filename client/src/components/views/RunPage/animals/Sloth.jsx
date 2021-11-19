import React, { useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import sloth from '../../../../img/sloth256.png';

const Sloth = (props) => {
    const [flip,set] = useState(false);
    const appear = useSpring({
        // opacity: props.isToggled ? 1:0,
        to: {opacity:1},
        from: {opacity:0},
        reset: true,
        reverse: flip,
        delay:100,
        onRest: () => set(!flip),
    })
    return (
        <div>
            <animated.img src={sloth} style={appear}/>
        </div>
    )
}
export default Sloth;