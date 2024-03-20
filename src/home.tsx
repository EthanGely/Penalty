import { useEffect, useState } from "react";
import './App.scss';
import { socket } from './main';
import { useNavigate } from "react-router-dom";

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
    </>
  )
}

export default Home;