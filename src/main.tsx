import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './home';
import Game from './game';
import './index.css'
import { io } from 'socket.io-client';

export const socket = io("http://localhost:3000");

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/game",
        element: <Game />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
