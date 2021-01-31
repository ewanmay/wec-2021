import React, { useContext, useEffect } from 'react';
import './App.css';
import GamePage from './components/GamePage';
import { AppContext } from './context/context';
import { Color, Game, Log } from './context/types';

function App() {
  const [state, dispatch] = useContext(AppContext)
  
  useEffect(() => {
    state.socket.on('player-color', (playerType: Color) => dispatch({ type: 'SET_USER_TEAM', payload: playerType }));
    state.socket.on('game-update', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    state.socket.on('make-game', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    state.socket.on('board-size', (size: number) => dispatch({ type: 'SET_BOARD_SIZE', payload: size }));    
    state.socket.on('vanguards-placed', (bool: Boolean) => dispatch({ type: 'SET_VANGUARD_MODE', payload: !bool }));
    state.socket.on('log-update', (log: Log) => dispatch({ type: 'UPDATE_LOG', payload: log }));
  }, [])

  return (
    <div className="App flex">
        <GamePage />
    </div>
  );
}

export default App;
