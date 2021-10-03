import Navi from './Navi';
import Home from './Home';
import './css/App.css';
import Run from './Run';
import AudioRecord from './AudioRecord';
import RecordingList from './RecordingList';
import Report from './Report';

function App() {
  return (
    <div className="App">
      {/* <Navi/>
      <Home/> */}
      {/* <Run/> */}
      {/* <RecordingList/> */}
      <Report date='2021.09.09' time='00:00:00'/>

    </div>
  );
}

export default App;
