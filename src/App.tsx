import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
// import {io} from 'socket.io-client'
// import icon from '../assets/icon.svg';

const Hello = () => {
  // const print = console.log;

  // var socket = io("https://linear-webhook-websocket-server.sambarrowclough.repl.co");

  // socket.emit("chat message", "hey");

  // socket.on("chat message", function (msg) {
  //   print('CLIENT#received')
  //   print(msg);
  // });

  return (
    <div>
      <div className="header bg-gray-700">
        <div className="header-burger-menu">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4.75 5.75H19.25"
            ></path>
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4.75 18.25H19.25"
            ></path>
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4.75 12H19.25"
            ></path>
          </svg>
        </div>
        <div className="header-show">Inbox</div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
