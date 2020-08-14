import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { TetrisGame } from "./TetrisGame";
import styled from "styled-components";
import { Color } from "./Types";

const MainBox = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MainBox>
          <TetrisGame
            background_color={{ red: 100, green: 100, blue: 100 }}
            empty_cell_color={{ red: 220, green: 220, blue: 220 }}
          />
        </MainBox>
      </header>
    </div>
  );
}

export default App;
