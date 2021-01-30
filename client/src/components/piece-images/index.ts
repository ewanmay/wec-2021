import WhiteBishop from './bishop-white.png'
import WhiteQueen from './queen-white.png'
import WhiteKing from './king-white.png'
import WhitePawn from './pawn-white.png'
import WhiteRook from './rook-white.png'
import WhiteKnight from './knight-white.png'
import WhiteVanguard from './vanguard-white.png'
import BlackKnight from './knight-black.png'
import BlackBishop from './bishop-black.png'
import BlackQueen from './queen-black.png'
import BlackKing from './king-black.png'
import BlackPawn from './pawn-black.png'
import BlackRook from './rook-black.png'
import BlackVanguard from './vanguard-black.png'

export interface PieceImages {
  WhiteKnight: string,
  WhiteBishop: string,
  WhiteQueen: string,
  WhiteKing: string,
  WhitePawn: string,
  WhiteRook: string,
  WhiteVanguard: string,
  BlackBishop: string,
  BlackQueen: string,
  BlackKing: string,
  BlackPawn: string,
  BlackRook: string,
  BlackVanguard: string,
  BlackKnight: string
}

const allPieces: PieceImages = {
  WhiteBishop,
  WhiteVanguard,
  WhiteQueen,
  WhiteKing,
  WhiteKnight,
  WhitePawn,
  WhiteRook,
  BlackBishop,
  BlackQueen,
  BlackKing,
  BlackVanguard,
  BlackPawn,
  BlackRook,
  BlackKnight
}

export default allPieces;