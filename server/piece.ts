import { Piece, PieceType, Coordinate, Color, Board } from '../client/src/context/types';

class ChessPiece implements Piece {
  color: Color = Color.Null
  type = PieceType.Empty
  coord: Coordinate
  queenCantPlayCounter = 0

  constructor(color, type: PieceType, startingCoord: Coordinate) {
    this.color = color
    this.type = type
    this.coord = startingCoord
  }

  static setCoordToPiece(startingCoord: Coordinate, piece: Piece) {
    piece.coord = startingCoord;
  }

  static isCoordEmpty(board: Board, targetCoord: Coordinate) {
    return board.tiles[targetCoord.row][targetCoord.col].piece.type === PieceType.Empty
  }

  static tryMoveDiagonal(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number, piece: Piece, allowJumping = false) {
    if (rowdiff !== coldiff) return false; // ensure diagonal
    const c = piece.coord
    if (allowJumping) return true
    // ensure something not in way
    //up,right
    if (targetCoord.row < c.row && targetCoord.col > c.col) {
      for (let row = c.row - 1, col = c.col + 1; row > targetCoord.row; row--, col++) {
        if (!ChessPiece.isCoordEmpty(board, { row, col })) {
          return false;
        }
      }
    }
    //up,left
    else if (targetCoord.row < c.row && targetCoord.col < c.col) {
      for (let row = c.row - 1, col = c.col - 1; row > targetCoord.row; row--, col--) {
        if (!ChessPiece.isCoordEmpty(board, { row, col })) {
          return false;
        }
      }
    }
    //down,right
    else if (targetCoord.row > c.row && targetCoord.col > c.col) {
      for (let row = c.row + 1, col = c.col + 1; row < targetCoord.row; row++, col++) {
        if (!ChessPiece.isCoordEmpty(board, { row, col })) {
          return false;
        }
      }
    }
    //down,left
    else if (targetCoord.row > c.row && targetCoord.col < c.col) {
      for (let row = c.row + 1, col = c.col - 1; row < targetCoord.row; row++, col--) {
        if (!ChessPiece.isCoordEmpty(board, { row, col })) {
          return false;
        }
      }
    }
    return true;
  }

  static tryMoveStraight(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number, piece: Piece, allowJumping = false) {
    if ([coldiff, rowdiff].filter(x => x === 0).length !== 1) return false; // ensure straight, exactly one of the diffs must be 0
    const c = piece.coord
    if (allowJumping) {
      return true
    }
    if ((targetCoord.row === c.row && coldiff === 1) || (targetCoord.col === c.col && rowdiff === 1)) {
      return true; //move L,R,U,D just 1 sq  
    }
    // ensure something not in way    
    //right
    if (targetCoord.row === c.row && targetCoord.col > c.col) {
      for (let i = c.col + 1; i < targetCoord.col; i++) {
        if (!ChessPiece.isCoordEmpty(board, { row: targetCoord.row, col: i })) return false
      }
      return true;
    }
    //left
    else if (targetCoord.row == c.row && targetCoord.col < c.col) {
      for (let i = targetCoord.col + 1; i < c.col; i++) {
        if (!ChessPiece.isCoordEmpty(board, { row: targetCoord.row, col: i })) return false
      }
      return true;
    }
    // up
    else if (targetCoord.col == c.col && targetCoord.row < c.row) {
      for (let i = c.row - 1; i > targetCoord.row; i--) {
        if (!ChessPiece.isCoordEmpty(board, { row: i, col: targetCoord.col })) return false
      }
      return true;
    }
    //down
    else if (targetCoord.col == c.col && targetCoord.row > c.row) {
      for (let i = c.row + 1; i < targetCoord.row; i++) {
        if (!ChessPiece.isCoordEmpty(board, { row: i, col: targetCoord.col })) return false
      }
      return true;
    }
    return false;
  }

  static isOpponent(targetPiece: Piece, piece: Piece): boolean {
    if (targetPiece.type === PieceType.Empty) return false
    return piece.color !== targetPiece.color
  }

  static tryMovePawn(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number, piece: Piece) {
    const c = piece.coord
    const targetPiece: Piece = board.tiles[targetCoord.row][targetCoord.col].piece
    if (piece.color === Color.White) {
      if (c.row - targetCoord.row > 3) return false // up to 3 spaces up
      if (targetCoord.row >= c.row) return false // cant move down
      for (let row = c.row - 1; row > targetCoord.row; row--) {
        if (!ChessPiece.isCoordEmpty(board, { row, col: c.col })) return false
      }
    } else { // black pawn moving down
      if (targetCoord.row - c.row > 3) return false // up to 3 spaces down
      if (targetCoord.row <= c.row) return false // cant move up
      for (let row = c.row + 1; row < targetCoord.row; row++) {
        if (!ChessPiece.isCoordEmpty(board, { row, col: c.col })) return false
      }
    }
    if (targetPiece.type === PieceType.Empty) {
      return c.col === targetCoord.col
    }
    else {
      return coldiff === 1 && ChessPiece.isOpponent(board.tiles[targetCoord.row][c.col].piece, piece)
    }
  }

  static bothArraysEmpty(a1: Piece[], a2: Piece[]) {
    return a1.every(p => p.type === PieceType.Empty) && a2.every(p => p.type === PieceType.Empty)
  }

  static tryMoveVanguard(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number, piece: Piece) {
    // move in an L of any size
    if ([rowdiff, coldiff].includes(0)) return false // must be an L shape; we are here for the W
    const c = piece.coord
    let piecesOnColumn
    let piecesOnRow
    //up,right
    if (targetCoord.row < c.row && targetCoord.col > c.col) {
      // up then right     
      piecesOnColumn = board.tiles.slice(targetCoord.row, c.row).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(c.col, targetCoord.col).map(tile => tile.piece)
      if (ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)) {
        return true
      }
      //right then up
      piecesOnRow = board.tiles[c.row].slice(c.col + 1, targetCoord.col + 1).map(tile => tile.piece)
      piecesOnColumn = board.tiles.slice(targetCoord.row + 1, c.row + 1).map(row => row[targetCoord.col].piece)
      return ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)
    }
    //up,left
    if (targetCoord.row < c.row && targetCoord.col < c.col) {
     // up then left     
      piecesOnColumn = board.tiles.slice(targetCoord.row, c.row).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(targetCoord.col + 1, c.col + 1).map(tile => tile.piece)
      if (ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)) {
            return true
      }
      //left then up
      piecesOnRow = board.tiles[c.row].slice(targetCoord.col, c.col).map(tile => tile.piece)
      piecesOnColumn = board.tiles.slice(targetCoord.row + 1, c.row + 1).map(row => row[targetCoord.col].piece)
      return ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)
    }
    //down,right
    else if (targetCoord.row > c.row && targetCoord.col > c.col) {
      // down then right
      piecesOnColumn = board.tiles.slice(c.row + 1, targetCoord.row + 1).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(c.col, targetCoord.col).map(tile => tile.piece)
      if (ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)) {
        return true
      }
      // right then down
      piecesOnRow = board.tiles[c.row].slice(c.col + 1, targetCoord.col + 1).map(tile => tile.piece)
      piecesOnColumn = board.tiles.slice(c.row, targetCoord.row).map(row => row[targetCoord.col].piece)
      return ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)
    }
    //down,left
    else if (targetCoord.row > c.row && targetCoord.col < c.col) {
      // down then left
      piecesOnColumn = board.tiles.slice(c.row + 1, targetCoord.row + 1).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(targetCoord.col + 1, c.col + 1).map(tile => tile.piece)
      if (ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)) {
        return true
      }
      // left then down
      piecesOnRow = board.tiles[c.row].slice(targetCoord.col, c.col).map(tile => tile.piece)
      piecesOnColumn = board.tiles.slice(c.row, targetCoord.row).map(row => row[targetCoord.col].piece)
      return ChessPiece.bothArraysEmpty(piecesOnColumn, piecesOnRow)
    }
    return false;
  }

  static tryMoveKnight(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number, piece: Piece) {
    //Move as a normal game’s queen except they can only reach 
    //between 2 and 4 (inclusive) squares away. Jumping is preserved
    if (rowdiff === 0) {
      // moving horizontal
      if (coldiff < 2 || coldiff > 4) return false
    }
    else if (coldiff === 0) {
      // if moving vertical
      if (rowdiff < 2 || rowdiff > 4) return false
    }
    else {
      // moving diag
      if (rowdiff < 2 || rowdiff > 4 || coldiff < 2 || coldiff > 4) {
        return false
      }
    }
    return (ChessPiece.tryMoveStraight(board, targetCoord, rowdiff, coldiff, piece, true)
      || ChessPiece.tryMoveDiagonal(board, targetCoord, rowdiff, coldiff, piece, true))
  }

  static tryMove(board: Board, targetCoord: Coordinate, piece: Piece): boolean {
    if (piece.type === PieceType.Empty) return false
    if (piece.type === PieceType.Queen && piece.queenCantPlayCounter > 0) return false
    const c = piece.coord
    const targetPiece: Piece = board.tiles[targetCoord.row][targetCoord.col].piece
    if (targetPiece.color === piece.color) {
      // cannot move where you already have a piece
      return false
    }
    const rowdiff = Math.abs(targetCoord.row - c.row);
    const coldiff = Math.abs(targetCoord.col - c.col);
    switch (piece.type) {
      case PieceType.Pawn:
        return ChessPiece.tryMovePawn(board, targetCoord, rowdiff, coldiff, piece)
      case PieceType.Knight:
        return ChessPiece.tryMoveKnight(board, targetCoord, rowdiff, coldiff, piece)
      case PieceType.Bishop:
        return ChessPiece.tryMoveDiagonal(board, targetCoord, rowdiff, coldiff, piece)
      case PieceType.Queen:
        return (ChessPiece.tryMoveStraight(board, targetCoord, rowdiff, coldiff, piece)
          || ChessPiece.tryMoveDiagonal(board, targetCoord, rowdiff, coldiff, piece))
      case PieceType.King:
        return ((rowdiff === 1 && [0, 1].includes(coldiff)) || (rowdiff === 0 && coldiff === 1))
      case PieceType.Rook:
        return ChessPiece.tryMoveStraight(board, targetCoord, rowdiff, coldiff, piece)
      case PieceType.Vanguard:
        return ChessPiece.tryMoveVanguard(board, targetCoord, rowdiff, coldiff, piece)
      default:
        return false
    }
  }


  static makeMove(board: Board, targetCoord: Coordinate, piece: Piece, pieceRemovedCallback: (piece: Piece) => void) {
    if (ChessPiece.tryMove(board, targetCoord, piece)) {
      if (piece.type === PieceType.Queen && (piece.queenCantPlayCounter === 0)) {
        piece.queenCantPlayCounter = 10;
      }

      board.tiles[piece.coord.row][piece.coord.col].piece = ChessPiece.emptyPiece({ row: piece.coord.row, col: piece.coord.col })
      if (board.tiles[targetCoord.row][targetCoord.col].piece.type != PieceType.Empty) {
        pieceRemovedCallback(board.tiles[targetCoord.row][targetCoord.col].piece)
      }
      piece.coord = targetCoord

      if (piece.type === PieceType.Pawn) { // Pawn Promotion 
        const promotionRow = piece.color === Color.White ? 0 : board.tiles.length - 1
        if (piece.coord.row === promotionRow) {
          piece.type = PieceType.Queen
        }
      }

      board.tiles[piece.coord.row][piece.coord.col].piece = piece
    }
  }

  static emptyPiece(coord: Coordinate): Piece{
    return new ChessPiece(Color.Null, PieceType.Empty, coord);
  }

  static moveMade(pieceThatWasMoved: Piece, piece: Piece){
    if(pieceThatWasMoved.type === PieceType.Queen && pieceThatWasMoved.color === piece.color){
      piece.queenCantPlayCounter = 10;
    }
    else{
      //console.log("Queen Cant PLAY: ", piece.queenCantPlayCounter - 1);
      piece.queenCantPlayCounter--;
    }
  }

}

module.exports = ChessPiece