import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
// import './css/App.css';
// import Run from './components/Run';
// import AudioRecord from './components/AudioRecord';
// import RecordingList from './components/RecordingList';
// import Report from './components/Report';
// import Landing from './components/Landing';
// import Home from './components/Home';

function App() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route exact path="/" component={LandingPage} />
                    <Route exact path="/login" component={LoginPage} />
                    <Route exact path="/register" component={RegisterPage} />
                </Switch>
            </div>
        </Router>
        // <div className="App">
        //     {/* <Landing/> */}
        //     <Home />
        //     {/* <Run/> */}
        //     {/* <RecordingList/> */}
        //     {/* < Report date='2021.09.09' time='00:00:00'/> */}
        // </div>
    );
}

export default App;
