import { Color, State } from "./types";
import { socket } from './socket';

const emptyRow = new Array(8);

for (let i = 0; i < emptyRow.length; i++) {
  emptyRow[i] = (new Array(8));
}

for (let i = 0; i < emptyRow.length; i++) {
  for (let j = 0; j < emptyRow.length; j++) {
    emptyRow[i][j] = {      
      piece: {},
      spacesToMove: []
    }
  }
}

const initialGame = {
  board: {
    tiles: emptyRow,    
    vanguards: 4, 
    whiteVanguards: 2,
    blackVanguards: 2
  },
  playersTurn: Color.Null, 
  inCheck: Color.Null,  
  takenPieces: [],
  started: false,
  boardLength: 8,  
  stalemate: false,
  winner: Color.Null
}

export const initialState: State = {
  socket,
  game: initialGame,
  playerTeam: Color.Null,  
  placingVanguards: false,
  log: { blackMoves: [], whiteMoves: []}
}