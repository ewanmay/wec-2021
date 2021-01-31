import React, { useContext, useEffect } from 'react';
import './App.css';
import GamePage from './components/GamePage';
import LandingPage from './components/LandingPage';
import { AppContext } from './context/context';
import { Color, Game } from './context/types';

function App() {
  const [state, dispatch] = useContext(AppContext)
  
  console.log(state.game.board.tiles)

  useEffect(() => {
    // setInterval(() => state.socket.emit("hello"), 2000);    
    // state.socket.on('hello-response', () => console.log("server said hello"));
    state.socket.on('player-color', (playerType: Color) => dispatch({ type: 'SET_USER_TEAM', payload: playerType }));
    state.socket.on('game-update', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    // state.socket.emit('make-game');
    state.socket.on('make-game', (game: Game) => dispatch({ type: 'UPDATE_GAME', payload: game }));
    state.socket.on('board-size', (size: number) => dispatch({ type: 'SET_BOARD_SIZE', payload: size }));
  }, [])

  return (
    <div className="App flex">
        <GamePage />
    </div>
  );
}

export default App;
