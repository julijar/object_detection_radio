//this file makes the server ? Yes
const SerialPort = require("serialport");
const static = require("node-static");
const http = require("http");
const fs = require("fs");
const socket = require("socket.io");

const file = new static.Server(__dirname);
const app = http.createServer(function (req, res) {
  file.serve(req, res);
});

const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
  delimiter: "\r\n",
});

let arduinoPort;
function setupPort(portPath, object) {
  object = new SerialPort(portPath, {
    baudRate: 9600,
    dataBits: 8,
    parity: "none",
    stopBits: 1,
    flowControl: false,
  });
  object.pipe(parser);
}

SerialPort.list().then(
  function (ports) {
    ports.forEach(function (port) {
      if (port.manufacturer.includes("Arduino")) {
        setupPort(port.path, arduinoPort);
      }
    });
  },
  function (error) {
    console.error(error);
  }
);

var io = socket.listen(app);
io.on("connection", function (socket) {
  console.log("Node is listening to port");
});
parser.on("data", function (data) {
  console.log("Received data from port: " + data);
  io.emit("data", data);
});

app.listen(3000);
