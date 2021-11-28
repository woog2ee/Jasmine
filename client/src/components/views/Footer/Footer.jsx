import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Footer(){

    return(
        <div className="mastfoot">
            <div className="inner">
                <p>
                    by{' '}<a href="https://github.com/idealization/Jasmine">Jasmine Team</a>.
                </p>
            </div>
        </div>
    )
}
export default Footer;