import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import immutable, { List } from "immutable";
import _ from "lodash";
import R from "ramda";
import { Color, Board } from "./Types";
import { Piece, PieceGenerator, fix_piece_on_board } from "./Piece";
import { useInterval } from "./useInterval";
import { TetrisGameView } from "./TetrisGameView";
import {
  create_board,
  create_empty_row,
  clear_rows,
  clear_row,
  get_clear_index,
} from "./utils";
import { TetrisStats } from "./TetrisStats";
import { assert } from "console";

interface TetrisGameProps {
  background_color: Color;
  empty_cell_color: Color;
  socket: SocketIOClient.Socket;
  host: boolean;
}

// This is pretty much the reducer pattern in redux.
type operation =
  | "NEW_GAME"
  | "PIECE_DOWN"
  | "PIECE_RIGHT"
  | "PIECE_LEFT"
  | "ROTATE_CLOCKWISE"
  | "ROTATE_COUNTER_CLOCKWISE"
  | "INCREMENT_SCORE"
  | "INCREMENT_LEVEL"
  | "INCREMENT_LINES_CLEARED"
  | "NEW_PIECE"
  | "FIX_PIECE"
  | "CLEAR_LINE"
  | "GAME_OVER";

type Action = {
  op: operation;
  data?: number;
};

export const TetrisGame = (props: TetrisGameProps) => {
  let { socket, host } = props;
  console.log("HOST IS ", host);
  let default_color = props.background_color;
  let empty_cell = props.empty_cell_color;
  let row_count = 22;

  let [dim, _setDim] = useState(!host);
  let dim_ref = useRef(dim);
  let setDim = (dim: boolean) => {
    _setDim(dim);
    dim_ref.current = dim;
  };

  let [board, setBoard] = useState<Board>(
    create_board(row_count, 10, empty_cell)
  );
  let [generator, _setGenerator] = useState(new PieceGenerator());
  let [piece, setPiece] = useState(generator.get_random_new_piece());
  let [score, setScore] = useState(0);
  let [linesCleared, setLinesCleared] = useState(0);
  let [level, setLevel] = useState(0);
  let [startOfGame, setStartOfGame] = useState(true);
  let [game_in_progress, set_game_in_progress] = useState(true);

  function reset_piece() {
    let new_piece_index = generator.get_random_piece_index();
    send_action({ op: "NEW_PIECE", data: new_piece_index });
    console.log("SETTING NEW PEICE!!!");
  }

  useEffect(() => {
    socket.off("message_recieved");
    socket.on("message_recieved", (data: any) => {
      console.log("Recieved data", data);
      execute_action(data);
    });
  }, [piece]);

  useEffect(() => {
    if (host) reset_piece();
  }, [host]);

  let new_game = () => {
    setBoard(create_board(row_count, 10, empty_cell));
    if (host) {
      reset_piece();
    }
    setScore(0);
    setLinesCleared(0);
    setLevel(0);
    set_game_in_progress(true);
  };

  let send_action = (act: Action) => {
    console.log("Emitting Action", act);
    socket.emit("message_sent", act);
  };

  let execute_action = (act: Action) => {
    console.log("EXECING Action", act);
    switch (act.op) {
      case "NEW_GAME":
        new_game();
        break;
      case "PIECE_DOWN":
        setPiece((piece) => piece.try_move_down(board, empty_cell));
        break;
      case "PIECE_RIGHT":
        setPiece((piece) => piece.try_move_right(board, empty_cell));
        break;
      case "PIECE_LEFT":
        setPiece((piece) => piece.try_move_left(board, empty_cell));
        break;
      case "ROTATE_CLOCKWISE":
        setPiece((piece) => piece.try_rotate_clockwise(board, empty_cell));
        break;
      case "ROTATE_COUNTER_CLOCKWISE":
        setPiece((piece) =>
          piece.try_rotate_counter_clockwise(board, empty_cell)
        );
        break;
      case "INCREMENT_SCORE":
        setScore((score) => score + act.data!);
        break;
      case "INCREMENT_LEVEL":
        setLevel((level) => level + act.data!);
        break;
      case "INCREMENT_LINES_CLEARED":
        setLinesCleared((linesCleared) => linesCleared + act.data!);
        break;
      case "NEW_PIECE":
        setPiece(generator.get_piece_i(act.data!));
        break;
      case "FIX_PIECE":
        setBoard((board) => fix_piece_on_board(piece, board));
        setDim(!dim);
        break;
      case "CLEAR_LINE":
        setBoard((board) => clear_row(board, act.data!, empty_cell));
        break;
      case "GAME_OVER":
        set_game_in_progress(false);
        break;
    }
  };

  let clear_single_row = (board: Board): [boolean, Board] => {
    console.log("clearing a row", board);
    let index_to_clear = get_clear_index(board, empty_cell);
    if (index_to_clear != -1) {
      send_action({ op: "CLEAR_LINE", data: index_to_clear });
      return [true, clear_row(board, index_to_clear, empty_cell)];
    }
    return [false, board];
  };

  let clear_rows = (old_board: Board) => {
    let [cleared_row, new_board] = clear_single_row(old_board);
    let num_rows_cleared = 0;
    while (cleared_row) {
      num_rows_cleared++;
      [cleared_row, new_board] = clear_single_row(new_board);
    }
    return num_rows_cleared;
  };

  let increment_score_after_lines_cleared = (n: number) => {
    switch (n) {
      case 0:
        return;
      case 1:
        send_action({ op: "INCREMENT_SCORE", data: 100 });
        break;
      case 2:
        send_action({ op: "INCREMENT_SCORE", data: 400 });
        break;
      case 3:
        send_action({ op: "INCREMENT_SCORE", data: 900 });
        break;
      case 4:
        send_action({ op: "INCREMENT_SCORE", data: 1600 });
        break;
    }
    send_action({ op: "INCREMENT_LINES_CLEARED", data: n });
  };

  let check_game_over = (new_piece: Piece) => {
    if (!new_piece.can_move(board, empty_cell, 0, 0)) {
      console.log("PIECE CANT BE HERE! GAME OVER!");
      send_action({ op: "GAME_OVER" });
    }
  };

  useInterval(() => {
    if (!game_in_progress || !host) return;
    console.log(piece);
    if (piece.can_move(board, empty_cell, 0, 1)) {
      send_action({ op: "PIECE_DOWN" });
    } else {
      let new_board = fix_piece_on_board(piece, board);
      send_action({ op: "FIX_PIECE" });
      let num_rows_cleared = clear_rows(new_board);
      increment_score_after_lines_cleared(num_rows_cleared);

      // setTimeout(() => {
      let new_piece_index = generator.get_random_piece_index();
      let new_piece = generator.get_piece_i(new_piece_index);
      send_action({ op: "NEW_PIECE", data: new_piece_index });
      check_game_over(new_piece);
      // }, 500);
    }
  }, 1000);

  useEffect(() => {
    let handleKeyPress = (event: any) => {
      console.log(event.key, "pressed");
      if (dim_ref.current) {
        console.log("DIM so NOT PRESSING");
        return;
      }
      if (event.key == "ArrowRight") {
        send_action({ op: "PIECE_RIGHT" });
      } else if (event.key == "ArrowLeft") {
        send_action({ op: "PIECE_LEFT" });
      } else if (event.key == "ArrowUp") {
        send_action({ op: "ROTATE_CLOCKWISE" });
      } else if (event.key == "ArrowDown") {
        send_action({ op: "ROTATE_COUNTER_CLOCKWISE" });
      } else if (event.key == " ") {
        if (piece.can_move(board, empty_cell, 0, 1))
          send_action({ op: "INCREMENT_SCORE", data: 1 });
        send_action({ op: "PIECE_DOWN" });
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [piece]);

  if (game_in_progress) {
    return (
      <TetrisContainer>
        <TetrisGameView
          board={board}
          background_color={default_color}
          unseen_starting_blocks={2}
          piece={piece}
          dim={dim}
        />
        <TetrisStats score={score} lines_cleared={linesCleared} level={level} />
      </TetrisContainer>
    );
  } else {
    return (
      <YouLost>
        <h2>Game Over</h2>
        <a onClick={() => new_game()}>Restart?</a>
      </YouLost>
    );
  }
};

const YouLost = styled.div`
  display: flex;
  flex-direction: column;
`;

const TetrisContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
