import React from 'react';
import './WinModal.css';

interface LogProps {
  log: string[]
}

function Log({ log }: LogProps) {
  return (
    <div className="flex col-12 p-0">
      <h6 className="col-12 p-0">Moves</h6>
      <div className="col-12 p-0 log-container">
        {log.map((entry, index) => <div className="log flex">
          <div className="col-auto log-number">{index + 1}.</div>
          <div className="col-auto log-move">{entry}</div></div>)}
      </div>
    </div>
  );
}

export default Log;
