import { useEffect, useState } from 'react';
import './game.scss';
import gardien from './assets/goalkeeper.png';
import ball from './assets/ball.png';
import { socket } from './main';
import { useNavigate } from "react-router-dom";
import axios from "axios";
let previousButton = 0;

function Game() {

    // Status du joueur (gardien ou tireur)
    const [isGoalKeeper, setIsGoalKeeper] = useState(false);

    // Score de la manche en cours (array contenant les tirs réussis ou non)
    const [score, setScore] = useState([]);

    // Nombre de tirs maximum de la manche en cours
    const [maxShots, setMaxShots] = useState(5);

    // Numéro de la manche en cours
    const [round, setRound] = useState(1);

    // Nombre maximum de manches de la partie
    const [maxRounds, setMaxRounds] = useState(4);

    // Nombre de points total
    const [totalPoints, setTotalPoints] = useState("0 - 0");

    // Nom des joueurs
    const [nomJoueurs, setNomJoueurs] = useState("");

    // Index de la position tirée
    const [indexShoot, setIndexShoot] = useState(-1);

    // Index du gardien
    const [indexGoalKeeper, setIndexGoalKeeper] = useState(-1);

    // Index de la position choisie à la manette
    const [indexController, setIndexController] = useState(-1);

    // ID de la manette à utiliser
    const [idController, setIdController] = useState(-1);

    // Index de la position de la balle
    const [indexBall, setIndexBall] = useState(-1);

    //Adresse IP client
    const [ip, setIP] = useState("");

    const navigate = useNavigate();

    const getData = async () => {
        const res = await axios.get("https://api.ipify.org/?format=json");
        console.log("ip : ", res.data.ip);

        setIP(res.data.ip);
    };

    // Function to update gamepad state
    function updateGamepadState() {
        const gamepads = navigator.getGamepads();

        //console.log("Trying to connect to gamepad : ", idController);

        // connect to affected gamepas
        if (idController >= 0 && gamepads && gamepads[idController]) {
            const gamepad = gamepads[idController];

            if (gamepad) {
                // Check if the gamepad is connected
                setIndexController(state => {
                    let indexCtrl = state;

                    if (!gamepad.buttons[14].pressed && !gamepad.buttons[15].pressed) {
                        previousButton = 0;
                    } else {
                        if (gamepad.buttons[14].pressed && previousButton != 14) {
                            indexCtrl--;
                            //console.log("flèche gauche");
                            previousButton = 14;
                        }

                        if (gamepad.buttons[15].pressed && previousButton != 15) {
                            indexCtrl++;
                            //console.log("flèche droite");
                            previousButton = 15;
                        }
                    }

                    //console.log("Selected index : ", Math.max(Math.min(indexCtrl, 2), 0));

                    if (gamepad.buttons[0].pressed) {
                        shoot(Math.max(Math.min(indexCtrl, 2), 0));
                        //console.log("bouton A");
                    }
                    return Math.max(Math.min(indexCtrl, 2), 0);
                });
            }
        }
    }

    useEffect(() => {
        getData();
    }, []);

    // Get role on page load
    useEffect(() => {
        socket.emit('getInfos');

        const listener = (event: GamepadEvent) => {
            console.log("Gamepad connected :", event.gamepad.index);
            socket.emit("gamePad", event.gamepad.index, ip);
        }

        window.removeEventListener("gamepadconnected", listener);
        window.addEventListener("gamepadconnected", listener);
    }, [ip])

    useEffect(() => {
        // getting the gamepad ID
        socket.off("gamePadID");
        socket.on("gamePadID", (id) => {
            console.log("Gamepad ID received : ", id);
            setIdController(id);

            setTimeout(() => {
                if (id == -1) {
                    navigator.getGamepads().forEach((gamepad) => {
                        if (gamepad) {
                            socket.emit("gamePad", gamepad.index, ip);
                        }
                    }
                    )
                }
            }, 1000);
        });

        return () => {
            socket.off("gamePadID");
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            updateGamepadState();
        }, 100);

        return () => clearInterval(interval);
    }, [idController]);

    useEffect(() => {
        // Setting basic infos about the game
        // Once per game
        socket.off('infos');
        socket.on('infos', (isGoalKeeper, maxShots, maxRounds, nomJoueurs, score) => {
            if (isGoalKeeper != null) {
                setIsGoalKeeper(isGoalKeeper);
            }

            if (maxShots !== null) {
                setMaxShots(maxShots);
            }

            if (maxRounds !== null) {
                setMaxRounds(maxRounds);
            }

            if (nomJoueurs !== null) {
                setNomJoueurs(nomJoueurs);
            }

            if (score !== null) {
                setScore(score);
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
        socket.on('shootUpdate', (round, totalPoints, shootIndex, indexGoalKeeper) => {
            setRound(round);
            setTotalPoints(totalPoints);

            if (shootIndex !== null) {
                setIndexShoot(shootIndex);
                setIndexBall(shootIndex);

                if (shootIndex == indexGoalKeeper && isGoalKeeper) {
                    navigator.vibrate(100);
                } else if (shootIndex != indexGoalKeeper && !isGoalKeeper) {
                    navigator.vibrate(100);
                } else {
                    navigator.vibrate(250);
                }
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
            socket.off('infos');
            socket.off("gamePadID");
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

    //console.log("Score :", score);
    return (
        <>
            <div className={(isGoalKeeper ? "goalkeeper" : "striker") + "Role"}>
                <h2>{"You are the " + (isGoalKeeper ? "goalkeeper" : "striker")}</h2>
                <h3>{isGoalKeeper ? "Defend your goal" : "Score a goal"}</h3>
                <h3>Round {round} / {maxRounds}</h3>
                <h4>{totalPoints}</h4>
                <h4>{nomJoueurs}</h4>
                <div className="scoreManche">
                    {Array.from({ length: maxShots }).map((_, index) => (
                        <div className={"score" + (score && score[index] === true ? " win" : (score && score[index] === false ? " fail" : ""))} key={index}></div>
                    ))}
                </div>
                <div className="game">
                    <div className="goal">
                        <div className={"goalkeeper" + (indexGoalKeeper != -1 ? " pos" + indexGoalKeeper : "")}>
                            <img src={gardien} />
                        </div>
                        <div className="shoots">
                            {[0, 1, 2].map((id) => (
                                <div className={(indexController !== -1 && indexController == id ? "active " : "") + (indexShoot != -1 && indexShoot == id ? "shoot shooted" : (indexShoot != -1 ? "shoot invisible" : "shoot"))} id={id.toString()} onClick={() => shoot(id)} key={id}></div>
                            ))}
                        </div>
                        <div className={"ball" + (indexBall != -1 ? " pos" + indexBall.toString() + (indexGoalKeeper != indexBall ? " missed" : "") : "")}>
                            <img src={ball} />
                        </div>
                    </div>
                    <div className="shooter"></div>
                </div>
            </div>
        </>
    )
}

export default Game;