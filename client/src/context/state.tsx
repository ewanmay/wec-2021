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
    vangards: 4, 
    whiteVangards: 2,
    blackVangards: 2
  },
  playersTurn: Color.Null, 
  inCheck: false, 
  winner: Color.Null,
}

export const initialState: State = {
  socket,
  game: initialGame,  
  playerTeam: Color.Null
}