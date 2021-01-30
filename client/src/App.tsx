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
    state.socket.on('player-color', (playerType: Color) => dispatch({ type: 'SET_USER_TEAM', payload: playerType }));
    state.socket.on('game-update', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    // state.socket.emit('make-game');
    state.socket.on('make-game', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    state.socket.on('board-size', (size: number) => dispatch({ type: 'SET_BOARD_SIZE', payload: size }));
  }, [])

  const handleReset = () => {
    state.socket.emit("reset")
  }

  return (
    <div className="App flex">
      <WinModal winner={state.game.winner} />
      <div className="col-3 p-1 flex center">
        <div className="col-10 flex center">
          {state.playerTeam !== Color.Null && <h4 className="col-12">You are playing as: {state.playerTeam}</h4>}
          {state.playerTeam === Color.Null && <h4 className="col-12">You are spectating</h4>}
          {state.game.inCheck && <h4 className="col-12">{state.playerTeam} is in check</h4>}
          {state.playerTeam !== Color.Null && <button className="btn btn-secondary" onClick={() => handleReset()}>Reset Game</button>}
          <div className="col-12 p-0">

            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Dropdown
                </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                <button className="dropdown-item" type="button">Action</button>
                <button className="dropdown-item" type="button">Another action</button>
                <button className="dropdown-item" type="button">Something else here</button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className="col-6 p-1 flex center">
        {state.game.playersTurn !== Color.Null && <h4 className="col-12">{`${state.game.playersTurn}'s move`}</h4>}
        <Board />
      </div>
    </div>
  );
}

export default App;
