# Team Meadow Lake WEC 2021 - Design Document

## Development Tools
For development, we used GitHub and the VsCode editor.

Github's version control allows us to track commits and revert changes if necessary. 
Within VsCode, we use the VsCode Live Share feature to collaborate on the same files in real time. Furthermore, this allows us to have shared servers - we can all test on the same client instance and server instance.

## Technologies

Our application is built with a client-server architechture. This seperation of concerns allows the client to be responsibile only for user interaction and rendering the current application state. The server is responsible for managing the game logic and storing the game state.

The client is built in TypeScript with React.

We chose TypeScript because it's type-checking allows us to explictly define the API exptectations between the client and server, and reduces bugs caused by misused variables. In our experience, TypeScript aids in code maintainability.

We use React on the front-end for dynamically rendering the user interface when the game state changes. We also use React to seperate our UI sections into resuable components.

For styling, we use a mixutre of custom styles and styles provided by `react-bootstrap`. 

The server is built in Node.js with TypeScript. This allows for easy setup and compatibility with our front-end, with same benefits of type checking.

We use websockets through Socket.IO for communication between the client and server. This allows for the rapid streaming of data. As our client and server send each other data each user interaction, websockets are more efficient than REST requests, which contain a lot of overhead.

Socket.IO also easily supports the use of concurrent users. Each client is stored on the server by it's socket, and Socket.IO allows us to communicate both with a single client, or to broadcast data to all connected clients at once.

Combined with all of the above advantages of each technology, our team also has experience with these frameworks and languages. These platforms can also be deployed to the cloud using AWS or Azure container services in the future.


## Work Division

The work was evenly distributed amongst each team member. With our client-server architecture, it was logical to separate into sub-groups working on the front-end and back-end, according to our skillsets. However, this sub-group division was not strict, as we all pitched in for peer-programming and bug fixing throughout the codebase as necessary.

Within the last 1.5 hours of the competition time, some members focused on creating the User Documentation (README.md), Design Documentation (this file), and slideshow presentation.
