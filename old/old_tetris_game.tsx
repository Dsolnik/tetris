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
}

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

type TetrisGameState = {
  board: Board;
  generator: PieceGenerator;
  piece: Piece;
  score: number;
  linesCleared: number;
  level: number;
  game_in_progress: boolean;

  //
  default_color: Color;
  empty_cell: Color;
  row_count: number;
};

export class TetrisGame extends React.Component<
  TetrisGameProps,
  TetrisGameState
> {
  constructor(props: TetrisGameProps) {
    super(props);

    let generator = new PieceGenerator();
    this.state = {
      row_count: 22,
      default_color: props.background_color,
      empty_cell: props.empty_cell_color,
      board: create_board(22, 10, this.props.empty_cell_color),
      generator,
      piece: generator.get_random_new_piece(),
      score: 0,
      linesCleared: 0,
      level: 0,
      game_in_progress: true,
    };

    this.new_game = this.new_game.bind(this);
    this.send_action = this.send_action.bind(this);
    this.execute_action = this.execute_action.bind(this);
    this.tick = this.tick.bind(this);
  }

  tick() {
    let clear_single_row = () => {
      console.log("clearing a row", this.state.board);
      let index_to_clear = get_clear_index(
        this.state.board,
        this.state.empty_cell
      );
      if (index_to_clear != -1) {
        this.send_action({ op: "CLEAR_LINE", data: index_to_clear });
        return true;
      }
      return false;
    };

    // let clear_rows = () => {
    //   let num_rows_cleared: number = 0;
    //   while (clear_single_row()) num_rows_cleared++;
    //   return num_rows_cleared;
    // };

    // let increment_score_after_lines_cleared = (n: number) => {
    //   switch (n) {
    //     case 0:
    //       return;
    //     case 1:
    //       send_action({ op: "INCREMENT_SCORE", data: 100 });
    //       break;
    //     case 2:
    //       send_action({ op: "INCREMENT_SCORE", data: 400 });
    //       break;
    //     case 3:
    //       send_action({ op: "INCREMENT_SCORE", data: 900 });
    //       break;
    //     case 4:
    //       send_action({ op: "INCREMENT_SCORE", data: 1600 });
    //       break;
    //   }
    //   send_action({ op: "INCREMENT_LINES_CLEARED", data: n });
    // };

    // let check_game_over = () => {
    //   if (!piece.can_move(board, empty_cell, 0, 0)) {
    //     console.log("PIECE CANT BE HERE! GAME OVER!");
    //     send_action({ op: "GAME_OVER" });
    //   }
    // };

    // useInterval(() => {
    //   if (!game_in_progress) return;
    //   if (piece.can_move(board, empty_cell, 0, 1)) {
    //     send_action({ op: "PIECE_DOWN" });
    //   } else {
    //     send_action({ op: "FIX_PIECE" });
    //     console.log("CLEARING ROWSSSSSS");
    //     let num_rows_cleared = clear_rows();
    //     console.log("CLEARING ROWSSSSSS DONE");
    //     increment_score_after_lines_cleared(num_rows_cleared);

    //     let new_piece_index = generator.get_random_piece_index();
    //     send_action({ op: "NEW_PIECE", data: new_piece_index });

    //     check_game_over();
    //   }
    // }, 1000);
  }

  new_game() {
    this.setState({
      board: create_board(this.state.row_count, 10, this.state.empty_cell),
      piece: this.state.generator.get_random_new_piece(),
      score: 0,
      linesCleared: 0,
      level: 0,
      game_in_progress: true,
    });
  }

  send_action(action: Action) {
    this.execute_action(action);
  }

  execute_action(act: Action) {
    let {
      board,
      empty_cell,
      piece,
      score,
      level,
      linesCleared,
      generator,
    } = this.state;
    let setPiece = (piece: Piece) => this.setState({ piece });
    console.log("Executing action", act);
    switch (act.op) {
      case "NEW_GAME":
        this.new_game();
        break;
      case "PIECE_DOWN":
        setPiece(piece.try_move_down(board, empty_cell));
        break;
      case "PIECE_RIGHT":
        setPiece(piece.try_move_right(board, empty_cell));
        break;
      case "PIECE_LEFT":
        setPiece(piece.try_move_left(board, empty_cell));
        break;
      case "ROTATE_CLOCKWISE":
        setPiece(piece.try_rotate_clockwise(board, empty_cell));
        break;
      case "ROTATE_COUNTER_CLOCKWISE":
        setPiece(piece.try_rotate_counter_clockwise(board, empty_cell));
        break;
      case "INCREMENT_SCORE":
        this.setState({ score: score + act.data! });
        break;
      case "INCREMENT_LEVEL":
        this.setState({ level: level + act.data! });
        break;
      case "INCREMENT_LINES_CLEARED":
        this.setState({ linesCleared: linesCleared + act.data! });
        break;
      case "NEW_PIECE":
        setPiece(generator.get_piece_i(act.data!));
        break;
      case "FIX_PIECE":
        this.setState({ board: fix_piece_on_board(piece, board) });
        break;
      case "CLEAR_LINE":
        this.setState({ board: clear_row(board, act.data!, empty_cell) });
        break;
      case "GAME_OVER":
        this.setState({ game_in_progress: false });
        break;
    }
  }

  render() {
    let {
      board,
      default_color,
      score,
      linesCleared,
      level,
      game_in_progress,
      piece,
    } = this.state;
    if (game_in_progress) {
      return (
        <TetrisContainer>
          <TetrisGameView
            board={board}
            background_color={default_color}
            unseen_starting_blocks={2}
            piece={piece}
          />
          <TetrisStats
            score={score}
            lines_cleared={linesCleared}
            level={level}
          />
        </TetrisContainer>
      );
    } else {
      return (
        <YouLost>
          <h2>Game Over</h2>
          <a onClick={() => this.new_game()}>Restart?</a>
        </YouLost>
      );
    }
  }
}

const YouLost = styled.div`
  display: flex;
  flex-direction: column;
`;

const TetrisContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

// let [board, setBoard] = useState<Board>(
//   create_board(row_count, 10, empty_cell)
// );
// let [generator, _setGenerator] = useState(new PieceGenerator());
// let [piece, setPiece] = useState(generator.get_random_new_piece());
// let [score, setScore] = useState(0);
// let [linesCleared, setLinesCleared] = useState(0);
// let [level, setLevel] = useState(0);
// let [game_in_progress, set_game_in_progress] = useState(true);

// let new_game = () => {
//   setBoard(create_board(row_count, 10, empty_cell));
//   setPiece(generator.get_random_new_piece());
//   setScore(0);
//   setLinesCleared(0);
//   setLevel(0);
//   set_game_in_progress(true);
// };

// let send_action = (act: action) => execute_action(act);

// let execute_action = (act: action) => {
//   console.log("Executing action", act);
//   switch (act.op) {
//     case "NEW_GAME":
//       new_game();
//       break;
//     case "PIECE_DOWN":
//       setPiece(piece.try_move_down(board, empty_cell));
//       break;
//     case "PIECE_RIGHT":
//       setPiece(piece.try_move_right(board, empty_cell));
//       break;
//     case "PIECE_LEFT":
//       setPiece(piece.try_move_left(board, empty_cell));
//       break;
//     case "ROTATE_CLOCKWISE":
//       setPiece(piece.try_rotate_clockwise(board, empty_cell));
//       break;
//     case "ROTATE_COUNTER_CLOCKWISE":
//       setPiece(piece.try_rotate_counter_clockwise(board, empty_cell));
//       break;
//     case "INCREMENT_SCORE":
//       setScore(score + act.data!);
//       break;
//     case "INCREMENT_LEVEL":
//       setLevel(level + act.data!);
//       break;
//     case "INCREMENT_LINES_CLEARED":
//       setLinesCleared(linesCleared + act.data!);
//       break;
//     case "NEW_PIECE":
//       setPiece(generator.get_piece_i(act.data!));
//       break;
//     case "FIX_PIECE":
//       setBoard(fix_piece_on_board(piece, board));
//       break;
//     case "CLEAR_LINE":
//       setBoard(clear_row(board, act.data!, empty_cell));
//       break;
//     case "GAME_OVER":
//       set_game_in_progress(false);
//       break;
//   }
// };

// let clear_single_row = () => {
//   console.log("clearing a row", board);
//   let index_to_clear = get_clear_index(board, empty_cell);
//   if (index_to_clear != -1) {
//     send_action({ op: "CLEAR_LINE", data: index_to_clear });
//     return true;
//   }
//   return false;
// };

// let clear_rows = () => {
//   let num_rows_cleared: number = 0;
//   while (clear_single_row()) num_rows_cleared++;
//   return num_rows_cleared;
// };

// let increment_score_after_lines_cleared = (n: number) => {
//   switch (n) {
//     case 0:
//       return;
//     case 1:
//       send_action({ op: "INCREMENT_SCORE", data: 100 });
//       break;
//     case 2:
//       send_action({ op: "INCREMENT_SCORE", data: 400 });
//       break;
//     case 3:
//       send_action({ op: "INCREMENT_SCORE", data: 900 });
//       break;
//     case 4:
//       send_action({ op: "INCREMENT_SCORE", data: 1600 });
//       break;
//   }
//   send_action({ op: "INCREMENT_LINES_CLEARED", data: n });
// };

// let check_game_over = () => {
//   if (!piece.can_move(board, empty_cell, 0, 0)) {
//     console.log("PIECE CANT BE HERE! GAME OVER!");
//     send_action({ op: "GAME_OVER" });
//   }
// };

// useInterval(() => {
//   if (!game_in_progress) return;
//   if (piece.can_move(board, empty_cell, 0, 1)) {
//     send_action({ op: "PIECE_DOWN" });
//   } else {
//     send_action({ op: "FIX_PIECE" });
//     console.log("CLEARING ROWSSSSSS");
//     let num_rows_cleared = clear_rows();
//     console.log("CLEARING ROWSSSSSS DONE");
//     increment_score_after_lines_cleared(num_rows_cleared);

//     let new_piece_index = generator.get_random_piece_index();
//     send_action({ op: "NEW_PIECE", data: new_piece_index });

//     check_game_over();
//   }
// }, 1000);

// useEffect(() => {
//   let handleKeyPress = (event: any) => {
//     console.log(event.key, "pressed");
//     if (event.key == "ArrowRight") {
//       send_action({ op: "PIECE_RIGHT" });
//     } else if (event.key == "ArrowLeft") {
//       send_action({ op: "PIECE_LEFT" });
//     } else if (event.key == "ArrowUp") {
//       send_action({ op: "ROTATE_CLOCKWISE" });
//       setPiece(piece.try_rotate_clockwise(board, empty_cell));
//     } else if (event.key == "ArrowDown") {
//       send_action({ op: "ROTATE_COUNTER_CLOCKWISE" });
//     } else if (event.key == " ") {
//       if (piece.can_move(board, empty_cell, 0, 1))
//         send_action({ op: "INCREMENT_SCORE", data: 1 });
//       send_action({ op: "PIECE_DOWN" });
//     }
//   };
//   document.addEventListener("keydown", handleKeyPress);
//   return () => document.removeEventListener("keydown", handleKeyPress);
// }, [piece]);
