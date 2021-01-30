import React from 'react';
import { Color } from '../context/types';
import './WinModal.css'
interface WinModalProps {
  winner: Color
}

function WinModal({ winner }: WinModalProps) {
  return (
    <>
    { winner !== Color.Null && (
      <div className="win-modal-background">
        <div className="win-modal flex center">
          <h3>Congratulations!</h3>
          {winner + " wins!"}
        </div>
      </div>
      )
    }
    </>
  );
}

export default WinModal;
