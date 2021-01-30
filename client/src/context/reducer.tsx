import { State } from "./types";

export const reducer = (state: State, action: Record<string, any>): State => {
  switch (action.type) {
    case "UPDATE_GAME": {
      console.log(action.payload)
      return { ...state, game: action.payload };
    }
    case "SET_USER_TEAM":
      return { ...state, playerTeam: action.payload };
    default: {
      return state;
    }
  }
}