import React, { useContext, useState } from 'react';
import { AppContext } from '../context/context';
import { BoardTiles, Color, Coordinate, Piece, PieceType as PieceEnum, PieceType } from '../context/types';
import ChessPiece from './ChessPiece';
import './Board.css'

export default function Board() {
  const [selectedPiece, setSelectedPiece] = useState({} as Piece)
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
    return { "width": 800 / state.game.boardLength, "height": 800 / state.game.boardLength };
  }

  const getRowDimensions = () => {
    return { "height": 800 / state.game.boardLength };
  }

  const getBoardDimensions = () => {
    return { "width": 820, "height": 820 };
  }

  const unselectAll = () => {
    selectPiece({} as Piece);
    setSelectedPieceCoordinates({} as Coordinate)
    setAvailableSelection([])
  }

  const placeVanguard = (rowIndex: number, colIndex: number, tile: BoardTiles) => {
    let vanguards = (state.playerTeam === Color.Black) ? state.game.board.blackVanguards : state.game.board.vanguards;
    vanguards = state.playerTeam === Color.White ? state.game.board.whiteVanguards : vanguards;
    if (tile.piece.type === PieceType.Pawn && tile.piece.color === state.playerTeam && vanguards < state.game.board.vanguards) {
      state.socket.emit("place-vanguard", { row: rowIndex, col: colIndex })
    }
  }

  const handleTileSelection = (row: number, col: number, tile: BoardTiles,) => {
    const piece = tile.piece;
    const selectionCoord = { row, col };

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

  const handleTileContextMenu = (row: number, col: number, tile: BoardTiles,) => {
    placeVanguard(row, col, tile)
  }

  const selectPiece = (piece: Piece) => {
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
    const newCoord = { row: rowIndex, col: colIndex };
    const isAvailable = isAvailableTile(newCoord)
    const isSelected = isSameTile(newCoord, selectedPieceCoordinates)
    return isSelected || isAvailable
  }

  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"]

  return (
    <div className="board flex center" style={getBoardDimensions()}>
      {state.game.board.tiles.map((row, rowIndex) =>
        <div className="col-12 p-0 flex row center" style={getRowDimensions()} key={Math.random()} >
          {row.map((tile, colIndex) => (

            <div className={`flex center tile p-0 
            ${getTileColor(rowIndex, colIndex)} 
            ${tile.piece.type !== PieceEnum.Empty ? "piece" : ""}`}
              onClick={(e) => { handleTileSelection(rowIndex, colIndex, tile) }}
              onContextMenu={(e) => {
                e.preventDefault()
                handleTileContextMenu(rowIndex, colIndex, tile)
              }}
              key={Math.random()}
              style={getTileDimensions()}>
              <div className={shouldHighlight(rowIndex, colIndex) ? "highlight flex center " : ""}>
                <ChessPiece piece={tile.piece}></ChessPiece>
                {colIndex === 0 && (<div className="row-number">
                  {rowIndex + 1}
                </div>)}
                {rowIndex === state.game.boardLength - 1 && (<div className="col-number">
                  {alphabet[colIndex]}
                </div>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
