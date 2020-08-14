import immutable, { List } from "immutable";
import _ from "lodash";
import { Color, Board } from "./Types";
import { set_cell, get_clear_index, create_empty_row } from "./utils";

function rotateCounterClockwise<T>(arr: T[][]) {
  var a = arr.map((row) => row.slice());
  var n = a.length;
  for (var i = 0; i < n / 2; i++) {
    for (var j = i; j < n - i - 1; j++) {
      var tmp = a[i][j];
      a[i][j] = a[j][n - i - 1];
      a[j][n - i - 1] = a[n - i - 1][n - j - 1];
      a[n - i - 1][n - j - 1] = a[n - j - 1][i];
      a[n - j - 1][i] = tmp;
    }
  }
  return a;
}

function clone<T>(instance: T): T {
  return deepCopy(instance) as T;
}

function deepCopy(obj: any): any {
  var copy: any;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

function rotateClockwise<T>(arr: T[][]) {
  var a = arr.map((row) => row.slice());
  var n = a.length;
  for (var i = 0; i < n / 2; i++) {
    for (var j = i; j < n - i - 1; j++) {
      var tmp = a[i][j];
      a[i][j] = a[n - j - 1][i];
      a[n - j - 1][i] = a[n - i - 1][n - j - 1];
      a[n - i - 1][n - j - 1] = a[j][n - i - 1];
      a[j][n - i - 1] = tmp;
    }
  }
  return a;
}

function copy_piece(piece: Piece): Piece {
  let new_piece = new Piece(
    clone(piece.color),
    clone(piece.piece),
    clone(piece.location)
  );
  console.log("copying piece ", new_piece);
  return new_piece;
}

export class Piece {
  color: Color;
  piece: boolean[][];
  location: [number, number];
  rows: number;
  cols: number;

  constructor(color: Color, piece: boolean[][], location: [number, number]) {
    this.color = color;
    this.piece = piece;
    this.location = location;
    this.rows = this.piece.length;
    this.cols = this.piece[0].length;
  }

  can_move(
    board: List<List<Color>>,
    default_color: Color,
    right: number,
    down: number
  ): boolean {
    let locs = this.get_locations();
    for (let i = 0; i < locs.length; i++) {
      let x = locs[i][0];
      let y = locs[i][1];
      let color_of_square = board.get(x + down)?.get(y + right);
      if (!_.isEqual(color_of_square, default_color) || y + right < 0) {
        return false;
      }
    }
    return true;
  }

  try_move_down(board: List<List<Color>>, default_color: Color): Piece {
    if (this.can_move(board, default_color, 0, 1)) {
      return this.move_down();
    }
    return this;
  }

  move_down(): Piece {
    console.log("changed location", this.location);
    return new Piece(this.color, this.piece, [
      this.location[0] + 1,
      this.location[1],
    ]);
  }

  try_move_right(board: List<List<Color>>, default_color: Color): Piece {
    if (this.can_move(board, default_color, 1, 0)) {
      return this.move_right();
    }
    return this;
  }

  move_right() {
    return new Piece(this.color, this.piece, [
      this.location[0],
      this.location[1] + 1,
    ]);
  }

  try_move_left(board: List<List<Color>>, default_color: Color): Piece {
    if (this.can_move(board, default_color, -1, 0)) {
      return this.move_left();
    }
    return this;
  }

  move_left() {
    return new Piece(this.color, this.piece, [
      this.location[0],
      this.location[1] - 1,
    ]);
  }

  get_locations(): [number, number][] {
    let locs: [number, number][] = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.piece[i][j] == true) {
          locs.push([this.location[0] + i, this.location[1] + j]);
        }
      }
    }
    console.log(locs);
    return locs;
  }

  try_rotate_clockwise(board: List<List<Color>>, default_color: Color): Piece {
    let newPiece = new Piece(
      this.color,
      rotateClockwise(this.piece),
      this.location
    );
    if (newPiece.can_move(board, default_color, 0, 0)) {
      return newPiece;
    }
    return this;
  }

  try_rotate_counter_clockwise(
    board: List<List<Color>>,
    default_color: Color
  ): Piece {
    let newPiece = new Piece(
      this.color,
      rotateCounterClockwise(this.piece),
      this.location
    );
    if (newPiece.can_move(board, default_color, 0, 0)) {
      return newPiece;
    }
    return this;
  }
}

export enum piece_index {
  CYAN_I = 0,
  NAVY_J = 1,
  ORANGE_L = 2,
  YELLOW_O = 3,
  GREEN_S = 4,
  PURPLE_T = 5,
  RED_Z = 6,
}

export class PieceGenerator {
  // CYAN I, NAVY_J, ORANGE_L, YELLOW_O, GREEN_S, PURPLE_T, RED_Z
  static pieces = [
    new Piece(
      { red: 0, green: 255, blue: 255 },
      [
        [false, false, false, false],
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
      ],
      [0, 5]
    ),
    new Piece(
      { red: 0, green: 0, blue: 128 },
      [
        [true, false, false],
        [true, true, true],
        [false, false, false],
      ],
      [1, 5]
    ),
    new Piece(
      { red: 0, green: 0, blue: 128 },
      [
        [false, false, true],
        [true, true, true],
        [false, false, false],
      ],
      [1, 5]
    ),
    new Piece(
      { red: 255, green: 255, blue: 0 },
      [
        [true, true],
        [true, true],
      ],
      [2, 5]
    ),
    new Piece(
      { red: 0, green: 255, blue: 0 },
      [
        [false, false, false],
        [false, true, true],
        [true, true, false],
      ],
      [1, 5]
    ),
    new Piece(
      { red: 128, green: 0, blue: 128 },
      [
        [false, false, false],
        [true, true, true],
        [false, true, false],
      ],
      [0, 5]
    ),
    new Piece(
      { red: 255, green: 0, blue: 0 },
      [
        [false, false, false],
        [true, true, false],
        [false, true, true],
      ],
      [1, 5]
    ),
  ];

  constructor() {}
  get_piece_i(i: piece_index) {
    let new_piece = copy_piece(PieceGenerator.pieces[i]);
    console.log(new_piece);
    return new_piece;
  }

  get_random_piece_index() {
    return Math.floor(Math.random() * PieceGenerator.pieces.length);
  }

  get_random_new_piece(): Piece {
    return this.get_piece_i(this.get_random_piece_index());
  }
}

export function fix_piece_on_board(piece: Piece, board: Board): Board {
  console.log("fixing piece", piece, "on board", board);
  let new_board = board;
  piece.get_locations().forEach((loc) => {
    new_board = set_cell(loc[0], loc[1], new_board, piece.color);
    console.log(new_board);
  });
  return new_board;
}
