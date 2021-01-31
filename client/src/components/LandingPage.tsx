import React, { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AppContext } from '../context/context';
import { Color } from '../context/types';

function LandingPage() {
  const [state, dispatch] = useContext(AppContext)

  const joinTeam = (color: Color) => {
    state.socket.emit("choose-team", color)
    dispatch({ type: "SELECT_TEAM", payload: color })
  }

  const handleResetTeam = () => {
    state.socket.emit("choose-team", Color.Null)
    dispatch({ type: "SELECT_TEAM", payload: Color.Null })
  }

  return (<div className="col-12 p-0 flex center">

    {state.playerTeam === Color.Null && (
      <div className="col-12 p-0 flex center">
        <button className="btn btn-primary m-1" onClick={() => joinTeam(Color.Black)}>Join as Black</button>
        <button className="btn btn-primary" onClick={() => joinTeam(Color.White)}>Join as White</button>
        <button className="btn btn-primary m-1" onClick={() => joinTeam(Color.Spectator)}>Join as Spectator</button>
      </div>)}
    {state.playerTeam !== Color.Null && (
      <div className="col-12 p-0 flex center">
        <div >You are playing as {state.playerTeam}</div>
      </div>)}
    {state.playerTeam !== Color.Null && <button className="btn btn-secondary m-1" onClick={() => handleResetTeam()}>Reset Team</button>}
    <div className="col-12 p-0 flex center">
    </div>
    <div className="col-12 p-0 flex center">
    </div>
  </div>)
}

export default LandingPage;
