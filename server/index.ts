import { Board, BoardTiles, PieceType, Game, Coordinate, Color, Piece } from '../client/src/context/types';


const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
})

const ChessPiece = require('./piece');

const PORT = process.env.PORT || 5000 



const board: Board = { tiles: [[]], vangards:0, whiteVangards:0, blackVangards:0 };
const game: Game = { board: board, playersTurn: Color.White, inCheck: Color.Null, winner: Color.Null, stalemate: false, boardLength: 0, started: false, takenPieces: []};
let numPlayers = 0;

const populateAvailableMoves = () => {
  if( board.blackVangards < board.vangards || board.whiteVangards < board.vangards){
    return;
  }

  board.tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const availableMoves = [];
      if(tile.piece.type != PieceType.Empty){
        for(let i = 0; i < board.tiles.length; i++){
          for(let j = 0; j < board.tiles.length; j++){
            const testCoord: Coordinate = {row: i, col: j};
            if(ChessPiece.tryMove(board, testCoord, tile.piece)){
              const newBoard: Board = JSON.parse(JSON.stringify(board));
              ChessPiece.makeMove(newBoard, testCoord, newBoard.tiles[rowIndex][colIndex].piece, ()=>{});

              newBoard.tiles.forEach((row, rowIndex) => {
                row.forEach((tile, colIndex) =>{
                  const availableMoves = [];
                  for(let x = 0; x < newBoard.tiles.length; x++){
                    for(let y = 0; y < newBoard.tiles.length; y++){
                      const temp: Coordinate = {row: x, col: y}                      
                      if(ChessPiece.tryMove(newBoard, temp, tile.piece)){
                        availableMoves.push(temp)
                      }
                    }
                  }
                  tile.spacesToMove = availableMoves;
                })
              })
              
              const otherColor: Color = tile.piece.color === Color.White? Color.Black : Color.White;
              if(!inCheck(otherColor, newBoard.tiles)){
                if(tile.piece.type === PieceType.Queen) {
                  console.log(tile.piece.color, 'Not in Check', testCoord)
                }
                availableMoves.push(testCoord);
              }
              else {
                if(tile.piece.type === PieceType.Queen) console.log(tile.piece.color, "In Check!!!!", testCoord);
              }

            }
          }
        }
      }
      tile.spacesToMove = availableMoves;
    });
  })
}

// Pass in the color whos turn it is.
const inCheck = (color: Color, tiles: BoardTiles[][])=> {
  let opponentKing: Coordinate = null;
  // find king
  tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      // TODO this is not performant, doesn't break loops after found. shouldn't use forEach's
      if(tile.piece.type === PieceType.King && tile.piece.color !== color && tile.piece.color !== Color.Null) {
        opponentKing = {row: rowIndex, col: colIndex};
      }
    })
  })

  // king gone
  if(opponentKing == null){
    // game.winner = color; 
    return true;
  }
  
  let inCheck = false;
  tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if(tile.piece.color === color){
        if(tile.spacesToMove.some(s => s.row === opponentKing.row && s.col === opponentKing.col)){
          inCheck = true;
        }
      }
    }) 
  })

  return inCheck;
}

const addTakenPiece = (piece: Piece)=> {
  console.log("piece taken!");
  game.takenPieces.push(piece);
}

createGame();
populateAvailableMoves();

io.on('connection', (socket) => {
  console.log('User Connected')
  let color: Color = Color.Null;
  socket.emit('make-game', game);

  socket.on('choose-team', (newColor: Color) => {
    console.log('choosing team', newColor)
    color = newColor; 
  });

  socket.on('start-game', () => {
    console.log('starting game');
    game.started = true;
    io.emit('game-update', game); 
  });

  
  socket.on('quit-game', () => {
    console.log('starting game');
    game.started = false;
    createGame();
    populateAvailableMoves();
    io.emit('game-update', game);
  }); 

  socket.on('reset', (size: number) => {
    console.log("reseting game", size)
    createGame(size);
    populateAvailableMoves();
    io.emit('game-update', game);
    console.log("reset game", size)
  })

  socket.on('make-move', (msg) => {
    console.log('making move');
    if( board.blackVangards < board.vangards || board.whiteVangards < board.vangards){
      return;
    }

    const movingPieceCoord: Coordinate = msg.movingPieceCoord;
    const coordToMoveTo: Coordinate = msg.coordToMoveTo;
    const piece: Piece = game.board.tiles[movingPieceCoord.row][movingPieceCoord.col].piece;
    
    // Try move IF is players turn
    if((game.playersTurn === piece.color) && ChessPiece.tryMove(game.board, coordToMoveTo, piece)){
      ChessPiece.makeMove(game.board, coordToMoveTo, piece, addTakenPiece)
      board.tiles.forEach(row => row.forEach(tile => ChessPiece.moveMade(piece, tile.piece)));
      // Change player turn 
      const oldPlayer = game.playersTurn;
      game.playersTurn = (game.playersTurn === Color.White)? Color.Black: Color.White

      populateAvailableMoves();
      if(inCheck(color, board.tiles)){
        game.inCheck = game.playersTurn;
        let count = 0;
      }
      else{
        game.inCheck = Color.Null;
      }
      if(!board.tiles.some(row => row.some(tile => (tile.piece.color === game.playersTurn && tile.spacesToMove.length > 0)))){
        console.log("Is there any available moves?")
        if(game.inCheck){
          // YOU LOST
          game.winner = oldPlayer;
          console.log("CHECKMATE")
        }
        else {
          // STALEMATE
          game.stalemate = true;
          console.log("STALEMATE BABBYYYYYYY")
        }
      }
      console.log("in check", game.inCheck);
      io.emit('game-update', game); 
    }
  })

  socket.on('place-vanguard', (pos: Coordinate) => {
    console.log("Placing vanguard", pos, color);
    
    const tile = board.tiles[pos.row][pos.col];
    if(color === Color.White && board.whiteVangards < board.vangards && tile.piece.color == Color.White && tile.piece.type == PieceType.Pawn){
      board.whiteVangards++;
      board.tiles[pos.row][pos.col] = { piece: new ChessPiece(Color.White, PieceType.Vanguard), spacesToMove: []};
      ChessPiece.setCoordToPiece(pos, board.tiles[pos.row][pos.col].piece)
      populateAvailableMoves();      
    } 
    else if(color === Color.Black && board.blackVangards < board.vangards && tile.piece.color == Color.Black && tile.piece.type == PieceType.Pawn){
      board.blackVangards++;
      board.tiles[pos.row][pos.col] = { piece: new ChessPiece(Color.Black, PieceType.Vanguard), spacesToMove: []};
      ChessPiece.setCoordToPiece(pos, board.tiles[pos.row][pos.col].piece)
      populateAvailableMoves();
    }

    io.emit('game-update', game); 

    // all vanguards placed
    if( board.blackVangards >= board.vangards && board.whiteVangards >= board.vangards){
      console.log("vanguards-placed");
      io.emit('vanguards-placed', true); 
    }
  })




  // socket.on('disconnect', () => {
  //   if(color === Color.White){
  //     playerState.white = false;
  //   }
  //   else if(color === Color.Black){
  //     playerState.black = false;
  //   }
  // })
})


function createGame(size: number = 8){
  console.log("creating game")
  game.playersTurn = Color.White;
  game.winner = Color.Null;
  game.boardLength = size;
  game.stalemate = false;
  game.inCheck = Color.Null;
  game.takenPieces = [];
  board.whiteVangards = 0;
  board.blackVangards = 0;
  board.tiles = [[]];

  switch (size) {
    case 8:
      console.log("Creating default sized board")
      board.vangards = 2; 
      board.tiles =  [
        [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
        new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
        new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(8).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
        [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
        { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
      ];
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
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(10).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
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
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(12).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
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
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(14).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
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
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
        new Array(16).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
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
    board.tiles =  [
      [{ piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Queen), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.King), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Bishop), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Knight), spacesToMove: [] },
      { piece: new ChessPiece(Color.Black, PieceType.Rook), spacesToMove: [] }],
      new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Black, PieceType.Pawn), spacesToMove: [] })),
      new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
      new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
      new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
      new Array(8).fill(0).map(x =>({ piece: new ChessPiece(Color.Null, PieceType.Empty), spacesToMove: [] })),
      new Array(8).fill(0).map(x => ({ piece: new ChessPiece(Color.White, PieceType.Pawn), spacesToMove: [] })),
      [{ piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Queen), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.King), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Bishop), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Knight), spacesToMove: [] },
      { piece: new ChessPiece(Color.White, PieceType.Rook), spacesToMove: [] }]
    ];
  }

  board.tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      ChessPiece.setCoordToPiece({row: rowIndex, col: colIndex}, tile.piece)
    })
  })
}



http.listen(PORT, () => console.log(`Listening on port ${PORT}`))