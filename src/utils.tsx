import { Color, Board } from "./Types";
import { List } from "immutable";
import { Piece } from "./Piece";
import _ from "lodash";

export const create_board = (rows: number, cols: number, color: Color) =>
  create_2d_array<Color>(rows, cols, color);

export const create_empty_row = (num_els: number, color: Color) =>
  create_list(num_els, color);

const create_list = (num_els: number, color: Color) => {
  let a: List<Color> = List([]);
  for (let i = 0; i < num_els; i++) {
    a = a.push(color);
  }
  return a;
};

function create_2d_array<T>(
  rows: number,
  cols: number,
  value: T
): List<List<T>> {
  let arr: List<List<T>> = List([]);
  for (let i = 0; i < rows; i++) {
    let row: T[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(value);
    }
    arr = arr.push(List(row));
  }
  return arr;
}

export function set_cell(
  row: number,
  col: number,
  new_board: any,
  color: Color
) {
  // Set `new_board`[`row`, `col`] = `color`
  return new_board.set(row, new_board.get(row)?.set(col, color));
}

export function get_clear_index(
  board: List<List<Color>>,
  empty_cell: Color
): number {
  for (let i = 0; i < board.size; i++) {
    let all_filled = board
      .get(i)
      ?.every((color: Color) => !_.isEqual(color, empty_cell));
    if (all_filled) {
      console.log(`Found row ${i} all filled`);
      return i;
    }
  }
  return -1;
}

export function clear_row(
  board: Board,
  index_to_clear: number,
  empty_cell: Color
): Board {
  return board.remove(index_to_clear).unshift(create_empty_row(10, empty_cell));
}

export function clear_rows(board: Board, empty_cell: Color): [Board, number] {
  let num_rows_cleared = 0;
  let index_to_clear = get_clear_index(board, empty_cell);
  while (index_to_clear != -1) {
    board = clear_row(board, index_to_clear, empty_cell);
    index_to_clear = get_clear_index(board, empty_cell);
    num_rows_cleared++;
  }
  return [board, num_rows_cleared];
}
