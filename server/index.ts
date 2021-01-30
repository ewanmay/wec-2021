import { Board, BoardTiles, PieceType, Game, Coordinate, Color } from '../client/src/context/types';


const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
})

const ChessPiece = require('./piece');

const PORT = process.env.PORT || 5000


const DEFAULT_TILES = [
  [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
  { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
  new Array(8).fill({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] }),
  new Array(8).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
  new Array(8).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
  new Array(8).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
  new Array(8).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
  new Array(8).fill({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] }),
  [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
  { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
];

const board: Board = { tiles: [[]], vangards:0, whiteVangards:0, blackVangards:0 };
const game: Game = { board: board, playersTurn: Color.White, inCheck: false, winner: Color.Null};
const playerState = {white: false, black: false};


io.on('connection', (socket) => {
  console.log('User Connected')
  let color = Color.Null;

  if(!playerState.white){
    playerState.white = true;
    color = Color.White;
    socket.emit('player-color', Color.White)
  }
  else if(!playerState.black){
    playerState.black = true;
    color = Color.Black;
    socket.emit('player-color', Color.Black)
  }
  else{
    socket.emit('player-color', Color.Null) // Do nothing, we dont support thhis
  }
  

  socket.on('make-game', (size: number) => {
    createGame(size);
    populateAvailableMoves();
    socket.emit('make-game', game);
  })

  socket.on('make-move', (movingPieceCoord: Coordinate, coordToMoveTo: Coordinate) => {
    // Get piece we want to move
    const piece = game.board[movingPieceCoord.row][movingPieceCoord.col].piece;
    
    // Try move IF is players turn
    if((game.playersTurn === piece.color) && piece.tryMove(game.board, coordToMoveTo)){
      piece.makeMove(game.board, coordToMoveTo)
      // Change player turn 
      game.playersTurn = (game.playersTurn === Color.White)? Color.Black: Color.White

      populateAvailableMoves();
      socket.emit('game-update', game);
    }
  })

  socket.on('place-vanguard', (pos: Coordinate) => {
    let tile = board.tiles[pos.row][pos.col];
    if(color === Color.White && board.whiteVangards < board.vangards && tile.piece.color == Color.White && tile.piece.type == PieceType.Pawn){
      board.whiteVangards++;
      board.tiles[pos.row][pos.col] = { piece: new ChessPiece(Color.White, PieceType.Vanguard), spacesToMove: []};
      populateAvailableMoves();
      // not allowed
    }
    else if(color === Color.Black && board.blackVangards < board.vangards && tile.piece.color == Color.Black && tile.piece.type == PieceType.Pawn){
      board.blackVangards++;
      board.tiles[pos.row][pos.col] = { piece: new ChessPiece(Color.Black, PieceType.Vanguard), spacesToMove: []};
      populateAvailableMoves();
      // not allowed
    }
    // not allowed
  })

  socket.on('game-reset', () => {
    // createGame();
    // populateAvailableMoves();
  })


  socket.on('disconnect', () => {
    if(color === Color.White){
      playerState.white = false;
    }
    else if(color === Color.Black){
      playerState.black = false;
    }
  })
})


function createGame(size: number = 8){
  console.log("creating game")
  game.playersTurn = Color.White;
  game.winner = Color.Null;
  board.whiteVangards = 0;
  board.blackVangards = 0;

  switch (size) {
    case 8:
      board.vangards = 2;
      board.tiles = DEFAULT_TILES;
      break;
    case 10:
      board.vangards = 2;
      board.tiles = [
        [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
        new Array(10).fill({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(10).fill({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] }),
        [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
      ];
      break;
    case 12:
      board.vangards = 3;
      board.tiles = [
        [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
        new Array(12).fill({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(12).fill({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] }),
        [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
      ];
      break;
    case 14:
      board.vangards = 3;
      board.tiles = [
        [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
        new Array(14).fill({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(14).fill({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] }),
        [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
      ];
      break;
    case 16:
      board.vangards = 4;
      board.tiles = [
        [{ piece: new ChessPiece(Color.Black, PieceType.Rook, {row: 0, col: 0}), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook, {row: 0, col: 1}), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight, {row: 0, col: 2}), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight, {row: 0, col: 3}), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop, {row: 0, col: 4}), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
        new Array(16).fill({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] }),
        new Array(16).fill({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] }),
        [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
      ];
      break;
    default:
    // return size 8 
    board.vangards = 2;
    board.tiles = DEFAULT_TILES;
  }

  board.tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      tile.piece.setCoordToPiece({row: rowIndex, col: colIndex})
    })
  })
}

const populateAvailableMoves = () => {
  console.log("Populating avail moves")
  board.tiles.forEach((row, rowIndex) => {
    console.log("In row foreach", rowIndex);
    row.forEach((tile, colIndex) => {
      console.log("In col foreach", tile)
      const availableMoves = [];
      if(tile.piece.type != PieceType.Empty){
        for(let i = 0; i < board.tiles.length; i++){
          for(let j = 0; j < board.tiles.length; j++){
            const testCoord: Coordinate = {row: i, col: j};
            if(tile.piece.tryMove(board, testCoord)){
              availableMoves.push(testCoord);
            }
          }
        }
      }
      tile.spacesToMove = availableMoves;
    });
  })
}

http.listen(PORT, () => console.log(`Listening on port ${PORT}`))