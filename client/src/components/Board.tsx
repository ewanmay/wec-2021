import React, { useContext, useState } from 'react';
import { AppContext } from '../context/context';
import { Coordinate, Piece as PieceType, PieceType as PieceEnum } from '../context/types';
import ChessPiece from './ChessPiece';
import './Board.css'

export default function Board() {
  const [selectedPiece, setSelectedPiece] = useState({} as PieceType)
  const [selectedPieceCoordinates, setSelectedPieceCoordinates] = useState({} as Coordinate)
  const [availableSelection, setAvailableSelection] = useState([] as Coordinate[])
  const [state, dispatch] = useContext(AppContext)

  const handleTileSelection = (rowIndex: number, colIndex: number, piece: PieceType) => {
    if (piece && !selectedPiece) {
      selectPiece(piece)
      setSelectedPieceCoordinates({ row: rowIndex, col: colIndex })
    }
    else if (piece && selectedPiece) {
      movePiece(rowIndex, colIndex)
    }
    else {
      selectPiece({} as PieceType);
      setSelectedPieceCoordinates({} as Coordinate)
    }
  }

  const selectPiece = (piece: PieceType) => {
    if (state.playerTeam === state.game.playersTurn) {
      setSelectedPiece(piece)
    }
  }

  const movePiece = (rowIndex: number, colIndex: number) => {
    if (state.playerTeam === state.game.playersTurn) {
      state.socket.emit("make-move",
        {
          movingPieceCoord: selectedPieceCoordinates,
          coordToMoveTo: { row: rowIndex, col: colIndex }
        })
    }
  }

  const getTileColor = (rowIndex: number, colIndex: number) => {
    if (rowIndex % 2 === 0) {
      return colIndex % 2 === 1 ? "b" : "w"
    }
    else {
      return colIndex % 2 === 1 ? "w" : "b"
    }
  }

  const isAvailable = (rowIndex: number, colIndex: number) => {
    return (availableSelection.includes({ row: rowIndex, col: colIndex }))
  }

  return (
    <div className="board flex center">
      {state.game.board.tiles.map((row, rowIndex) =>
        <div className="col-12 p-0 flex row center" key={Math.random()}>
          {row.map((tile, colIndex) => (

            <div className={`flex center tile p-0 
            ${getTileColor(rowIndex, colIndex)} 
            ${tile.piece.type !== PieceEnum.Empty ? "piece" : ""}
            ${isAvailable(rowIndex, colIndex) ? "highlight" : ""}
            `}
              onClick={() => handleTileSelection(rowIndex, colIndex, tile.piece)}
              key={Math.random()}>
              <ChessPiece piece={tile.piece}></ChessPiece>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
