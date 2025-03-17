> **DEMO** Please be aware, im using a free instance for the demo and it may take 50 seconds or more to spin up the instance.

# Bomberman Mayhem
Building a basic multiplayer bomberman type game using babylon.js and colyseus

## Rules
- Player move around using keyboard arrows
- Each player starts with 1 bomb and 1 heart
- Player can place bombs (1 at a time) by pressing the scape key on the keyboard
- Bomb will explode automatically after 3 seconds (bomb explosion radius is of 4 squares)
- Anyone in the explosion radius will lose 1 health
- Player can find powerups after breaking wall using they bombs
- Anyone players who gets under 1 health will be considered dead
- Last player alive will be declared the winner

## Power Ups Available
There is a 40% chance a powerup appears every time a player destroys a breakable wall.
- Heart (will give player 1 extra health till a max of 3) 
- Bomb (will give player 1 extra bomb till a max of 3)
- Speed (will give player 1 extra speed till a max of 3)

## Current Progress
- WIP

## ASCII Map Maker
I use https://stmn.github.io/ascii-map-editor/ to generate all the maps.

Cell types currently available: 
- W (wall)
- S (spwanpoint)
- G (ground)

## Requirements
- Download and install [Node.js LTS](https://nodejs.org/en/download/)
- Clone or download this repository.
- Run `npm install`

## Technology
- Babylon.js 6.x.x [https://www.babylonjs.com/](https://www.babylonjs.com/)
- Colyseus 0.15.x [https://colyseus.io/](https://colyseus.io/)

## How to run
- Run `npm run server-dev` to launch the server
- Run `npm run client-dev` to launch the client

> The client should be accessible at [`http://localhost:8080`](http://localhost:8080)
> The server should be available locally at [http://localhost:3000](http://localhost:3000)

## Credits
"Cartoon Bomb💣" (https://skfb.ly/o6QoW) by CioJay is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).