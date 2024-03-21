import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './home';
import Game from './game';
import Winner from './components/winner';
import Looser from './components/looser';
import './index.scss'
import { io } from 'socket.io-client';

export const socket = io("https://serverpenalty.onrender.com");

//export const socket = io("localhost:3000");

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/game",
        element: <Game />,
    },
    {
        path: "/winner",
        element: < Winner/>,
    },
    {
        path: "/looser",
        element: <Looser />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
