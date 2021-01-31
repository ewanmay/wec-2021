export interface State {
  socket: SocketIOClient.Socket,
  game: Game,
  playerTeam: Color,  
  placingVanguards: boolean,
  log: Log
}

export interface Coordinate {
  row: number,
  col: number
}

export enum Color {
  White = "White",
  Black = "Black",
  Spectator = "Spectator",
  Null = "Null"
}

export interface Game {
  board: Board,
  playersTurn: Color,
  inCheck: Color,
  winner: Color,
  stalemate: boolean, 
  boardLength: number,
  started: boolean,
  takenPieces: Piece[]
}

export interface Board {
  tiles: BoardTiles[][],
  vanguards: number, 
  whiteVanguards: number,
  blackVanguards: number
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
  queenCantPlayCounter: number,
  coord: Coordinate,
  // tryMove: (board: Board, targetCoord: Coordinate) => boolean,
  // makeMove: (board: Board, targetCoord: Coordinate) => void,
  // setCoordToPiece: (startingCoord: Coordinate) => void,
  // moveMade: (piece: Piece) => void,
}

export interface BoardTiles { 
  piece: Piece,
  spacesToMove: Coordinate[]
}

export interface Log {
  blackMoves: string[],
  whiteMoves: string[]
}