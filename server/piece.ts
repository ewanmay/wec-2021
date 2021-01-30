import {Piece, PieceType, Coordinate, Color, Board} from '../client/src/context/types';

class ChessPiece implements Piece {
  color: Color = Color.Null
  type = PieceType.Empty
  coord: Coordinate

  constructor(color, type: PieceType, startingCoord: Coordinate){
    this.color = color
    this.type = type
    this.coord = startingCoord
  }

  setCoordToPiece(startingCoord: Coordinate) {
    this.coord = startingCoord;
  }

  isCoordEmpty(board: Board, targetCoord: Coordinate){
    console.log("targetCoord: ", targetCoord);
    return board.tiles[targetCoord.row][targetCoord.col].piece.type === PieceType.Empty
  }

  tryMoveDiagonal(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number){
    if (rowdiff !== coldiff) return false; // ensure diagonal
    const c = this.coord
    // ensure something not in way
    let j = 0;
    return false;
    //up,right
    if (targetCoord.row<c.row && targetCoord.col>c.col){
      j = targetCoord.col-1;
      do{
        for (let i=targetCoord.row+1; i< c.row; i++){
          if (!this.isCoordEmpty(board, {row: i, col: j})){ 
            return false;
          }
          j--;
          if(j < 0 || j > board.tiles.length){
            break;
          }
        }
      } while (j>c.col);
    }
    //up,left
    else if (targetCoord.row<c.row && targetCoord.col<c.col){
      j = targetCoord.col+1;
      do{
        for (let i=targetCoord.row+1; i< c.row; i++){
          if (!this.isCoordEmpty(board, {row: i, col: j})){ 
            return false;
          }      
          j++;
          if(j < 0 || j > board.tiles.length){
            break;
          }
        }
      }while (j<c.col);
    }
    //down,right
    else if (targetCoord.row>c.row && targetCoord.col>c.col) {
      j = c.row+1;
      do {
        for (let i=c.row+1; i< targetCoord.row; i++) {
          if (!this.isCoordEmpty(board, {row: i, col: j})){ 
            return false;
          }      
          j++;
          if(j < 0 || j > board.tiles.length){
            break;
          }
        }
      } while (j<targetCoord.col);
    }
    //down,left
    else if (targetCoord.row>c.row && targetCoord.col<c.col)
    {
      j = c.row-1;
      do {
        for (let i=c.row+1; i< targetCoord.row; i++) {
          if (!this.isCoordEmpty(board, {row: i, col: j})){ 
            return false;
          }      
          j--;
          if(j < 0 || j > board.tiles.length){
            break;
          }
        }
      }
      while (j>targetCoord.col);
    }
    return true;
  }

  tryMoveStraight(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number){
    if ([coldiff, rowdiff].filter(x=>x===0).length != 1) return false; // ensure str
    const c = this.coord
    if (rowdiff === 1 && coldiff === 1){
      return true //move L,R,U,D just 1 sq
    }  
    // ensure something not in way    
    //right  
    else if (targetCoord.row===c.row && targetCoord.col>c.col){             
      for (let i = c.col+1; i<targetCoord.col; i++){
          if (!this.isCoordEmpty(board, {row: targetCoord.row, col: i})) return false
      }
      return true;
    }
    //left
    else if (targetCoord.row==c.row && targetCoord.col<c.col) {             
      for (let i = targetCoord.col+1; i <c.col; i++) {
          if (!this.isCoordEmpty(board, {row: targetCoord.row, col: i})) return false
      }
      return true;
    } 
    // up
    else if (targetCoord.col==c.col && targetCoord.row<c.row) {             
      for (let i = c.row-1; i >targetCoord.row; i--) {
          if (!this.isCoordEmpty(board, {row: i, col: targetCoord.col})) return false
      }
      return true;
    } 
    //down
    else if (targetCoord.col==c.col && targetCoord.row>c.row) {             
      for (let i = c.row+1; i <targetCoord.row; i++) {
          if (!this.isCoordEmpty(board, {row: i, col: targetCoord.col})) return false
      }
      return true;
    }    
    return false;
  }

  isOpponent(targetPiece: Piece):boolean {
    if (targetPiece.type === PieceType.Empty) return false
    return this.color !== targetPiece.color
  }

  tryMovePawn(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number){
    const c = this.coord
    const targetPiece: Piece = board.tiles[targetCoord.row][targetCoord.col].piece
    if (this.color === Color.White){
      if(targetCoord.row === c.row - 1 && targetPiece.type === PieceType.Empty){
        // white pawn move up 1. remember that smaller row index means up
        return true
      }
      else {
        // white pawn capture up-diag
        return this.isOpponent(targetPiece) && targetCoord.row === c.row - 1 && coldiff === 1
      }
    } else {
      if(targetCoord.row === c.row + 1 && targetPiece.type === PieceType.Empty){
        // black pawn move down 1
        return true
      }
      else {
        // black pawn capture down-diag
        return this.isOpponent(targetPiece) && targetCoord.row === c.row + 1 && coldiff === 1
      }
    }
    return false;
  }

  bothArraysEmpty(a1: Piece[], a2: Piece[]) {
    return a1.every(p => p.type === PieceType.Empty) && a2.every(p => p.type === PieceType.Empty)
  }

  tryMoveVanguard(board: Board, targetCoord: Coordinate, rowdiff: number, coldiff: number){
    // move in an L of any size
    if ([rowdiff, coldiff].includes(0)) return false // must be an L
    const c = this.coord
    const targetPiece: Piece = board.tiles[targetCoord.row][targetCoord.col].piece
    let piecesOnColumn 
    let piecesOnRow
    //up,right
    if (targetCoord.row<c.row && targetCoord.col>c.col){
      // up then right     
      piecesOnColumn = board.tiles.slice(targetCoord.row,c.row).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(c.col,targetCoord.col).map(tile => tile.piece)      
      if (this.bothArraysEmpty(piecesOnColumn,piecesOnRow)){
        return true
      }
      //right then up
      piecesOnRow = board.tiles[c.row].slice(c.col+1,targetCoord.col+1).map(tile => tile.piece)      
      piecesOnColumn = board.tiles.slice(targetCoord.row+1,c.row+1).map(row => row[targetCoord.col].piece)
      return this.bothArraysEmpty(piecesOnColumn,piecesOnRow)
    }
    //up,left
    else if (targetCoord.row<c.row && targetCoord.col<c.col){
      // up then left     
      piecesOnRow = board.tiles[targetCoord.row].slice(targetCoord.col+1,c.col+1).map(tile => tile.piece)      
      piecesOnColumn = board.tiles.slice(targetCoord.row,c.row).map(row => row[c.col].piece)
      if (this.bothArraysEmpty(piecesOnColumn,piecesOnRow)){
        return true
      }
      //left then up
      piecesOnRow = board.tiles[c.row].slice(targetCoord.col,c.col).map(tile => tile.piece)      
      piecesOnColumn = board.tiles.slice(targetCoord.row+1,c.row+1).map(row => row[targetCoord.col].piece)
      return this.bothArraysEmpty(piecesOnColumn,piecesOnRow)
    }
    //down,right
    else if (targetCoord.row>c.row && targetCoord.col>c.col) {
      // down then right
      piecesOnColumn = board.tiles.slice(c.row,targetCoord.row+1).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(c.col,targetCoord.col).map(tile => tile.piece)      
      if (this.bothArraysEmpty(piecesOnColumn,piecesOnRow)){
        return true
      }
      // right then down
      piecesOnRow = board.tiles[c.row].slice(c.col+1,targetCoord.col+1).map(tile => tile.piece)      
      piecesOnColumn = board.tiles.slice(c.row,targetCoord.row).map(row => row[targetCoord.col].piece)
      return this.bothArraysEmpty(piecesOnColumn,piecesOnRow)
    }
    //down,left
    else if (targetCoord.row>c.row && targetCoord.col<c.col) {
      // down then left
      piecesOnColumn = board.tiles.slice(c.row+1,targetCoord.row+1).map(row => row[c.col].piece)
      piecesOnRow = board.tiles[targetCoord.row].slice(targetCoord.col+1,c.col+1).map(tile => tile.piece)      
      if (this.bothArraysEmpty(piecesOnColumn,piecesOnRow)){
        return true
      }
      // left then down
      piecesOnRow = board.tiles[c.row].slice(targetCoord.col,c.col).map(tile => tile.piece) 
      piecesOnColumn = board.tiles.slice(c.row,targetCoord.row).map(row => row[targetCoord.col].piece)
      return this.bothArraysEmpty(piecesOnColumn,piecesOnRow)
    }
    return false;
  }

  tryMove(board: Board, targetCoord: Coordinate): boolean{
    if (this.type === PieceType.Empty) return false
    const c = this.coord
    console.log("This Coord: ", this.coord)
    console.log("My Type: ", this.type)
    const targetPiece: Piece = board.tiles[targetCoord.row][targetCoord.col].piece
    if (targetPiece.color === this.color){
      // cannot move where you already have a piece
      return false
    }
    const rowdiff= Math.abs(targetCoord.row-c.row);
    const coldiff= Math.abs(targetCoord.col-c.col);
    switch(this.type){
      case PieceType.Pawn:
        return this.tryMovePawn(board, targetCoord, rowdiff, coldiff)
      case PieceType.Knight:
        return (rowdiff === 2 && coldiff === 1) || (rowdiff === 1 && coldiff === 2)
      case PieceType.Bishop:
        return this.tryMoveDiagonal(board, targetCoord, rowdiff, coldiff)
      case PieceType.Queen:
        return this.tryMoveStraight(board, targetCoord, rowdiff, coldiff) || this.tryMoveDiagonal(board, targetCoord, rowdiff, coldiff)
      case PieceType.King:
        return rowdiff === 1 && coldiff === 1
      case PieceType.Rook:
        return this.tryMoveStraight(board, targetCoord, rowdiff, coldiff)
      case PieceType.Vanguard: 
      return false // TODO
      default:
        return false
    }
  }

  makeMove(board: Board, targetCoord: Coordinate) {
    if(this.tryMove(board, targetCoord)){
      board.tiles[this.coord.row][this.coord.col].piece = this.emptyPiece({row: this.coord.row, col: this.coord.col})
      this.coord = targetCoord
      board.tiles[this.coord.row][this.coord.col].piece = this
      // TODO: Remove piece if taking it - Maybe this already works?
    }
  }

  emptyPiece(coord: Coordinate): Piece{
    return new ChessPiece(Color.Null, PieceType.Empty, coord);
  }

}

module.exports = ChessPiece