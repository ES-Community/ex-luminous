# Ex-luminous

Game created for the [Ludum dare 45](https://ldjam.com/) with some members of the french JavaScript community. That's why we chose to create a Game with JavaScript and WebGL (Three.js).

The theme is **Start with nothing**.

- [Game Design Document](https://docs.google.com/document/d/1ft9IEibEpYvIbGuqpn922L7SIRGF9lMqE_YVCs0QUO4/edit#heading=h.830n83v349z2)

## Prerequisites

- [Node.js 12](https://nodejs.org/en/)

## Getting Started

```bash
$ git clone https://github.com/ES-Community/ludum-dare-45.git
$ cd ludum-dare-45
```

And then install the **client** and the **server**.

Server:

```bash
$ cd server
$ npm ci
```

Client:

```bash
$ cd ../client
$ npm ci
```

After which you will be able to launch the game at the root of the **client** directory

```bash
$ npm start
```

## Build

The game can be built for Windows, macOS and Linux.

```bash
cd client
npm ci
npm run package-$ARCH
```

With `$ARCH` being either `win`, `mac` or `linux`.

This creates a directory with the game launcher and assets in `client/dist`.

## How to play

Z,Q,S,D for movement and right click to rotate the camera.

## Credits

TBC

## License

MIT
