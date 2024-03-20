import { useEffect, useState } from 'react';
import './game.scss';
import gardien from './assets/goalkeeper.png';
import ball from './assets/ball.png';
import { socket } from './main';
import { useNavigate } from "react-router-dom";



function Game() {

    // Status du joueur (gardien ou tireur)
    const [isGoalKeeper, setIsGoalKeeper] = useState(false);
    // Score de la manche en cours
    const [score, setScore] = useState("");
    // Nombre de tirs de la manche en cours
    const [shoots, setShoots] = useState("Shoot 0/5");
    // Numéro de la manche en cours
    const [round, setRound] = useState("Round 1/5");
    // Index de la position tirée
    const [indexShoot, setIndexShoot] = useState(-1);
    // Index du gardien
    const [indexGoalKeeper, setIndexGoalKeeper] = useState(-1);
    //Ball index
    const [indexBall, setIndexBall] = useState(-1);

    const navigate = useNavigate();

    // Get role on page load
    useEffect(() => {
        socket.emit('getRole')
    })

    useEffect(() => {
        // Setting role
        socket.off('role');
        socket.on('role', (role) => {
            if (role == "goalkeeper") {
                setIsGoalKeeper(true);
            } else {
                setIsGoalKeeper(false);
            }
        });

        // redirect (to home page)
        socket.off('location');
        socket.on('location', (location) => {
            navigate(location);
        });

        // update score
        socket.off('scoreUpdate');
        socket.on('scoreUpdate', (scores) => {
            setScore(scores);
        });

        // update shoot / round / goalKeeper pos (both player shooted)
        socket.off('shootUpdate');
        socket.on('shootUpdate', (shoots, maxShoot, round, maxRound, shootIndex, indexGoalKeeper) => {
            setShoots("Shoot " + shoots + "/" + maxShoot);
            setRound("Round " + round + "/" + maxRound);

            if (shootIndex !== null) {
                setIndexShoot(shootIndex);
                setIndexBall(shootIndex);
            }

            if (indexGoalKeeper !== null) {
                setIndexGoalKeeper(indexGoalKeeper);
            }

        });

        socket.off("newShoot");
        socket.on('newShoot', () => {
            setIndexShoot(-1);
            setIndexGoalKeeper(-1);
            setIndexBall(-1);
        })

        socket.off('posGoalkeeper');
        socket.on("posGoalkeeper", (index) => {
            setIndexGoalKeeper(index);
        })

        socket.off('posShoot');
        socket.on("posShoot", (index) => {
            setIndexShoot(index);
        })

        return () => {
            socket.off('role');
            socket.off('location');
            socket.off('scoreUpdate');
            socket.off('shootUpdate');
            socket.off('posGoalkeeper');
            socket.off("newShoot");
            socket.off("posShoot");
        }
    }, []);

    // Function used to shoot
    const shoot = (index: number) => {
        socket.emit("shoot", index);
    }

    return (
        <>
            <h1>Penalty game</h1>
            <h2>{isGoalKeeper ? "Goalkeeper" : "Striker"}</h2>
            <h2>{score}</h2>
            <h2>{shoots}</h2>
            <h2>{round}</h2>
            <h3>{isGoalKeeper ? "Defend your goal" : "Score a goal"}</h3>
            <div className="game">
                <div className="goal">
                    <div className={"goalkeeper" + (indexGoalKeeper != -1 ? " pos" + indexGoalKeeper : "")}>
                        <img src={gardien} />
                    </div>
                    <div className="shoots">
                        {[0, 1, 2].map((id) => (
                            <div className={indexShoot != -1 && indexShoot == id ? "shoot shooted" : (indexShoot != -1 ? "shoot invisible" : "shoot")} id={id.toString()} onClick={() => shoot(id)} key={id}></div>
                        ))}
                    </div>
                    <div className={"ball" + (indexBall != -1 ? " pos" + indexBall.toString() + (indexGoalKeeper != indexBall ? " missed" : ""): "")}>
                        <img src={ball} />
                    </div>
                </div>
                <div className="shooter"></div>
            </div>
        </>
    )
}

export default Game;