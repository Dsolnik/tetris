import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import styled from "styled-components";
import { Color } from "./Types";
import { RoomCover } from "./RoomCover";
import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.min.css";

const MainBox = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

function App() {
  let [socket, setSocket] = useState(io("ws://localhost:3000"));

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected YEEEE!");
      socket.send("Hello");
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <RoomCover socket={socket}></RoomCover>
      </header>
    </div>
  );
}

export default App;
