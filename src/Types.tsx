import immutable, { List } from "immutable";
import _ from "lodash";
import { Piece } from "./Piece";

export type Color = { red: number; green: number; blue: number };
export type Board = List<List<Color>>;
export type BoardRow = List<Color>;
