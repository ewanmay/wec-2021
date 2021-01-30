import React from 'react';
import { Color, Piece, PieceType } from '../context/types';
import allPieces, { PieceImages } from './piece-images/index';

interface PieceProps {
  piece: Piece
}

function ChessPiece({ piece }: PieceProps) {
  const getPieceImage = (pieceType: PieceType, color: Color) => {
      let objectString = "";
      objectString += color
      objectString += pieceType.charAt(0).toUpperCase() + pieceType.slice(1)  
      return allPieces[objectString as keyof PieceImages] as any
  }

  return (
    <div className="piece cursor">
      {((piece.type && piece.color && piece.color !== Color.Null)) && (
        <img src={getPieceImage(piece.type, piece.color)} alt="chesspiece"></img>
        )}
    </div>
  );
}

export default ChessPiece;
