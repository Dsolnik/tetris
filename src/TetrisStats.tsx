import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

interface TetrisStatsProps {
  lines_cleared: number;
  level: number;
  score: number;
}

export const TetrisStats = (props: TetrisStatsProps) => (
  <TetrisContainer>
    <h2>Score: {props.score}</h2>
    <h2>Lines Cleared: {props.lines_cleared}</h2>
    <h2>Level: {props.level}</h2>
  </TetrisContainer>
);

const TetrisContainer = styled.div`
  width: 200px;
  height: 900px;
  display: flex;
  flex-direction: column;
  align-items: space-evenly;
  justify-content: space-evenly;
`;
