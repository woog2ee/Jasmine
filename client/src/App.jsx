/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
import Run from './components/views/RunPage/Run';
import Loading from './components/views/FinishPage/Loading';
import Finish from './components/views/FinishPage/Finish';
import Loading from './components/views/FinishPage/Loading';
import RecordingList from './components/views/RecordingListPage/RecordingList';
import Report from './components/views/ReportPage/Report';
import Home from './components/views/HomePage/Home';
import Auth from './hoc/auth';
import './css/App.css';

function App() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route exact path="/" component={Auth(LandingPage, null)} />
                    <Route exact path="/login" component={Auth(LoginPage, false)} />
                    <Route exact path="/register" component={Auth(RegisterPage, false)} />
                    <Route exact path="/home" component={Auth(Home, true)} />
                    <Route exact path="/run" component={Auth(Run, true)} />
                    <Route exact path="/loading" component={Auth(Loading, true)} />
                    <Route exact path="/finish" component={Auth(Finish, true)} />
                    <Route exact path="/list" component={Auth(RecordingList, true)} />
                </Switch>
                <Route exact path="/report" component={Auth(Report, true)} />
            </div>
        </Router>
    );
}

export default App;
