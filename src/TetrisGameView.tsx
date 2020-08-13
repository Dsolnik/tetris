import React, { useState, useEffect, useRef } from "react";
import immutable, { List } from "immutable";
import { Color, Board } from "./Types";
import { Piece } from "./Piece";
import styled from "styled-components";

interface TetrisGameViewProps {
  board: Board;
  unseen_starting_blocks: number;
  piece: Piece;
  background_color: Color;
}
export const TetrisGameView = ({
  board,
  unseen_starting_blocks,
  piece,
  background_color,
}: TetrisGameViewProps) => {
  let locations = piece.get_locations();
  return (
    <TetrisContainer>
      {board.slice(unseen_starting_blocks).map((row, i) => (
        <TetrisRow key={i}>
          {row.map((color, j) => {
            let elem_color = locations.some(
              (el) => el[0] == i + 2 && el[1] == j
            )
              ? piece.color
              : color;
            return (
              <TetrisBlock
                key={`${i + 2},${j}`}
                elem_color={elem_color}
                border_color={avg_colors(background_color, elem_color)}
              />
            );
          })}
        </TetrisRow>
      ))}
    </TetrisContainer>
  );
};

const TetrisContainer = styled.div`
  width: 460px;
  height: 900px;
  background-color: rgb(100, 100, 100);
  display: flex;
  flex-direction: column;
  align-items: space-evenly;
  justify-content: space-evenly;
`;

const avg_colors = (color: Color, other: Color) => ({
  red: (color.red + other.red) / 2,
  green: (color.green + other.green) / 2,
  blue: (color.blue + other.blue) / 2,
});

const rgb = (color: Color) =>
  `rgb(${color.red}, ${color.green}, ${color.blue})`;

const TetrisBlock = styled.div<{ border_color: Color; elem_color: Color }>`
  background-color: ${(props) => rgb(props.elem_color)};
  height: 30px;
  width: 30px;
  display: flex;
  border: 5px solid ${(props) => rgb(props.border_color)};
  overflow: hidden;
`;

const TetrisRow = styled.div`
  display: flex;
  justify-content: space-evenly;
`;
