import { useEffect, useState } from "react";
import './App.scss';
import { socket } from './main';
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.jpg'

function Home() {

  const [playerName, setPlayerName] = useState('');
  const [isWaiting, setisWaiting] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {

    socket.on('waiting', () => {
      setisWaiting(true);
    });

    socket.on('startGame', () => {
      navigate("/game");
    });
  }, []);

  const submitPlayerName = () => {
    socket.emit('playerName', playerName);
  }


  return (
    <>
      <nav>
        <div className="logo">
          <img src={logo} />
        </div>
        <a href="/">Home</a>
        <a href="https://simon-pwa-sigma.vercel.app/" className='external' target='_blank'>Simon game</a>
        <a href="http://82.66.255.189/webSockets/theMind/" className='external' target='_blank'>The Mind</a>
        <a href="http://82.66.255.189/" className='external' target='_blank'>Mind Guardians</a>
      </nav>
      <h1>Penalty game</h1>
      <div className="w50">
        <label htmlFor="playerName">Player name</label>
        <input
          id='playerName'
          type="text"
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className={isWaiting ? "isWaiting" : ""}
          disabled={isWaiting}
        />
        <button
          onClick={() => submitPlayerName()}
          disabled={isWaiting}
          className={isWaiting ? "isWaiting" : ""}>
          {isWaiting ? "Waiting for player" : "Find a match"}
        </button>
      </div>

      <div className="car"></div>
    </>
  )
}

export default Home;