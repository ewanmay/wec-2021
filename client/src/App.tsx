import React, { useContext, useEffect } from 'react';
import { AppContext } from './context/context';
import { Color, Game } from './context/types'
import './App.css';
import Board from './components/Board';
import WinModal from './components/WinModal';

function App() {
  const [state, dispatch] = useContext(AppContext)

  useEffect(() => {
    // setInterval(() => state.socket.emit("hello"), 2000);    
    // state.socket.on('hello-response', () => console.log("server said hello"));
    state.socket.on('connection', (playerType: "w" | "b") => dispatch({ type: 'SET_USER_TEAM', payload: playerType }));
    state.socket.on('game-update', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    state.socket.emit('make-game');
    state.socket.on('make-game', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
  }, [])

  const handleReset = () => {
    state.socket.emit("reset")
  }

  return (
    <div className="App">
      <WinModal winner={state.game.winner} />
      <div className="col-12 p-1 flex center">
        <div className="col-6 flex center">
          {state.playerTeam !== Color.Null && <h4 className="col-4">You are playing as: {state.playerTeam}</h4>}
          {state.playerTeam === Color.Null && <h4 className="col-4">You are spectating</h4>}
          {state.playerTeam !== Color.Null && <button className="btn btn-secondary" onClick={handleReset}>Reset Game</button>}
          {state.game.playersTurn !== Color.Null && <h4 className="col-4">{`${state.game.playersTurn}'s move`}</h4>}
        </div>
      </div>
      <div className="col-12 p-1 flex center">
        <Board />
      </div>
    </div>
  );
}

export default App;
