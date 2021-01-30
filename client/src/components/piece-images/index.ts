import WhiteBishop from './bishop-white.png'
import WhiteQueen from './queen-white.png'
import WhiteKing from './king-white.png'
import WhitePawn from './pawn-white.png'
import WhiteRook from './rook-white.png'
import BlackBishop from './bishop-black.png'
import BlackQueen from './queen-black.png'
import BlackKing from './king-black.png'
import BlackPawn from './pawn-black.png'
import BlackRook from './rook-black.png'

export interface PieceImages {
  WhiteBishop: string,
  WhiteQueen: string,
  WhiteKing: string,
  WhitePawn: string,
  WhiteRook: string,
  BlackBishop: string,
  BlackQueen: string,
  BlackKing: string,
  BlackPawn: string,
  BlackRook: string
}

const allPieces: PieceImages = {
  WhiteBishop,
  WhiteQueen,
  WhiteKing,
  WhitePawn,
  WhiteRook,
  BlackBishop,
  BlackQueen,
  BlackKing,
  BlackPawn,
  BlackRook
}

export default allPieces;