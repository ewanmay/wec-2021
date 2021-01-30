import React, { useContext, useState } from 'react';
import { AppContext } from '../context/context';
import { BoardTiles, Coordinate, Piece as PieceType, PieceType as PieceEnum } from '../context/types';
import ChessPiece from './ChessPiece';
import './Board.css'

export default function Board() {
  const [selectedPiece, setSelectedPiece] = useState({} as PieceType)
  const [selectedPieceCoordinates, setSelectedPieceCoordinates] = useState({} as Coordinate)
  const [availableSelection, setAvailableSelection] = useState([] as Coordinate[])
  const [state,] = useContext(AppContext)

  const isAvailableTile = (selectionCoord: Coordinate) => {
    return availableSelection.some(item => item.row === selectionCoord.row && item.col === selectionCoord.col)
  }
  const isSameTile = (coord1: Coordinate, coord2: Coordinate) => {
    return coord1.col === coord2.col && coord2.row === coord1.row
  }

  const getTileDimensions = () => {
    switch(state.game.boardLength) {
      case 8:
        return {"width": 100, "height": 100};
      case 10:
        return {"width": 90, "height": 90};
      case 12:
        return {"width": 80, "height": 80};
      case 14:        
        return {"width": 70, "height": 70};
    }
  }

  const getRowDimensions = () => {
    switch(state.game.boardLength) {
      case 8:
        return { "height": 100};
      case 10:
        return {"height": 90};
      case 12:
        return {"height": 80};
      case 14:        
        return {"height": 70};
    }
  }

  const getBoardDimensions = () => {
    switch(state.game.boardLength) {
      case 8:
        return {"width": 820, "height": 820};
      case 10:
        return {"width": 920, "height": 920};
      case 12:
        return {"width": 980, "height": 980};
      case 14:        
        return {"width": 1000, "height": 1000};
    }    
  }

  const unselectAll = () => {    
    selectPiece({} as PieceType);
    setSelectedPieceCoordinates({} as Coordinate)
    setAvailableSelection([])
  }

  const handleTileSelection = (rowIndex: number, colIndex: number, tile: BoardTiles,) => {
    const piece = tile.piece;
    const selectionCoord = { row: rowIndex, col: colIndex };
    if (piece && selectedPiece && isAvailableTile(selectionCoord)) {
      movePiece(selectionCoord)
      unselectAll()
    }   
    else if (isSameTile(selectionCoord, selectedPieceCoordinates)) {
      unselectAll()
    }  
    else if (piece && piece.color === state.playerTeam && state.game.playersTurn === state.playerTeam) {
      selectPiece(piece)
      setSelectedPieceCoordinates(selectionCoord)
      setAvailableSelection(tile.spacesToMove)
    }   
    else {
      unselectAll()
    }
  }

  const selectPiece = (piece: PieceType) => {
    if (state.playerTeam === state.game.playersTurn) {
      setSelectedPiece(piece)
    }
  }

  const movePiece = (selectionCoord: Coordinate) => {
    if (state.playerTeam === state.game.playersTurn) {
      state.socket.emit("make-move",
        {
          movingPieceCoord: selectedPieceCoordinates,
          coordToMoveTo: selectionCoord
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

  const shouldHighlight = (rowIndex: number, colIndex: number) => {
    const newCoord = {row: rowIndex, col: colIndex};
    const isAvailable = isAvailableTile(newCoord)
    const isSelected = isSameTile(newCoord, selectedPieceCoordinates)
    return isSelected || isAvailable
  }

  return (
    <div className="board flex center" style={getBoardDimensions()}>
      {state.game.board.tiles.map((row, rowIndex) =>
        <div className="col-12 p-0 flex row center" style={getRowDimensions()} key={Math.random()} >
          {row.map((tile, colIndex) => (

            <div className={`flex center tile p-0 
            ${getTileColor(rowIndex, colIndex)} 
            ${tile.piece.type !== PieceEnum.Empty ? "piece" : ""}`}
              onClick={() => handleTileSelection(rowIndex, colIndex, tile)}
              key={Math.random()}
              style={getTileDimensions()}>
              <div className={shouldHighlight(rowIndex, colIndex) ? "highlight flex center " : ""}>
                <ChessPiece piece={tile.piece}></ChessPiece>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
