export interface State {
  socket: SocketIOClient.Socket,
  game: Game,
  playerTeam: Color
}

export interface Coordinate {
  row: number,
  col: number
}

export enum Color {
  White = "White",
  Black = "Black",
  Null = "Null"
}

export interface Game {
  board: Board,
  playersTurn: Color,
  inCheck: boolean,
  winner: Color
}

export interface Board {
  tiles: BoardTiles[][],
  vangards: number, 
  whiteVangards: number,
  blackVangards: number
}

export enum PieceType {
  Pawn = "pawn",
  Knight = "knight",
  Bishop = "bishop",
  Queen = "queen",
  King = "king",
  Rook = "rook",
  Vanguard = "vanguard",  
  Empty = ""
}

export interface Piece {
  color: Color,
  type: PieceType,
  tryMove: (board: Board, targetCoord: Coordinate) => boolean,
  setCoordToPiece: (startingCoord: Coordinate) => void,
}

export interface BoardTiles { 
  piece: Piece,
  spacesToMove: Coordinate[]
}