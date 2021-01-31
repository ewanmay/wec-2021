# Team Meadow Lake WEC 2021 - User Documentation
## To run the app
Clone the repo. 

Running the app requires node and npm to be installed. All other dependencies are managed by npm.

Open two terminal tabs that will run the server and client respectively.

To build run the server:
```
cd server && npm i
npm start
```
The server runs on localhost:5000.

To build and run the client:
```
cd client && npm i
npm start
```
The client runs on localhost:3000.

## To play the game

Open your browser to the client, `localhost:3000`. Select which side you would like to join; white or black. If you do not select, you can spectate others playing the game.

Select the board size you would like to play and hit *Start Game*.

Now, you can right-click on your Pawns to change them into Vanguards. There is a limited amount of Vanguards that can be placed, depending on the board size. 

Once each side has placed their Vanguards, the game movements begin. White moves first.

To make a move, click the piece you want to move. The available tiles to which they are permitted to move are highlighted. Click on one of the highlighted tiles to move there. If you move to a tile containing an enemy piece, that piece is captured. 

You are notified if you are in check if one of the enemy pieces is currently threatening your King. Your next move must remove the check, either my moving the King to safety, blocking the check with another piece, or capturing the threat.

Moves made by each player are displayed in the logs. Pieces captured are shown as well.

If you are in check and cannot save your king, this is *checkmate*, and the game is over - you lose.

If you are not in check and have no available moves, by any piece, this is a *stalemate* - the game is a draw.

## Resetting the Game

At any point, you can reset the game.

*Reset Board* restarts the game with the same board size.

*Change Board* restarts the game and allows you to select a different board size.

## Changing teams

*Reset Team* changes which side/color you are on. By changing you team after every move, you can play by yourself.

## Play with Friends

Any new browser tab that navigates to the app can join the existing game.

Multiple players can join each team, and each player has the right to move on their team's behalf.

## Design Document

The Design Document is provided in Design-Document.md.