import { State } from "./types";

export const reducer = (state: State, action: Record<string, any>): State => {  
  console.log(action.payload);
  switch (action.type) {
    case "UPDATE_GAME": {
      console.log(action.payload)
      return { ...state, game: action.payload };
    }
    case "SET_USER_TEAM":
      return { ...state, playerTeam: action.payload };
    case "SET_BOARD_SIZE":
      return {...state, game: {...state.game, boardLength: action.payload}}
    default: {
      return state;
    }
  }
}