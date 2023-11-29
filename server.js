const { Server } = require("net");
const host = "0.0.0.0";
const END = "END";

const connections = new Map();

const error = (message) => {
  console.error(message);
  process.exit(1); //0: Everything OK | 1: there was an error.
};

const sendMessage = (message, origin) => {
  for(const socket of connections.keys()){
    if(socket !== origin){
      socket.write(message);
    }
  }
};

const listen = (port) => {
  const server = new Server();
  server.on("connection", (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`New connection from ${remoteSocket}`);
    socket.setEncoding("utf-8");

    socket.on("data", (message) => {
      if (!connections.has(socket)) {
        console.log(`username ${message} set for connection ${remoteSocket}`);
        connections.set(socket, message);
      } else if (message === END) {
        console.log(`Connection with ${remoteSocket} closed`);
        connections.delete(socket);
        socket.end();
      } else {
        
        const fullMessage = `[${connections.get(socket)}]:${message}`;
        console.log(`${remoteSocket}->${fullMessage}`);
        sendMessage(fullMessage, socket)
      }
    });
    socket.on("close", () => {
      console.log(`Connection with ${remoteSocket} closed.`);
    });

    socket.on("error", (err) => error(err.message));
  });
  server.listen({ port, host }, () => {
    //0.0.0.0 means that only IP version 4 will be accepted.
    console.log("Listeneing on port 8000");
  });

  server.on("error", (err) => error(err.message));
};
const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`);
  }

  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }
  port = parseInt(port);
  listen(port);
};
if (require.main === module) {
  main();
}
