import { State } from "./types";

export const reducer = (state: State, action: Record<string, any>): State => {
  switch (action.type) {
    case "UPDATE_GAME": {
      return { ...state, game: action.payload };
    }
    case "SET_USER_TEAM":
      return { ...state, playerTeam: action.payload };
    case "SET_BOARD_SIZE":
      return { ...state, game: { ...state.game, boardLength: action.payload } }
    case "SELECT_TEAM": {
      return { ...state, playerTeam: action.payload }
    }
    case "SET_VANGUARD_MODE": {
      return { ...state, placingVanguards: action.payload }
    }
    case "UPDATE_LOG": {
      return { ...state, log: action.payload }
    }
    default: {
      return state;
    }
  }
}