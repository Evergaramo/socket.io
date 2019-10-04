var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const Jugador = require('./modules/jugador.js');

// array jugadores
var n_jugadores = 1;
var jugadores = [{id: n_jugadores.toString(),
                  objeto_jugador: new Jugador("Carlos Azaustre", "")
                  }];

var messages = [{
  id: 1,
  text: "Hola soy un mensaje",
  // buscamos su nombre
  author: jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.nombre
}];

app.use(express.static('public'));

app.get('/hello', function(req, res) {
  res.status(200).send("Hello World!");
});

io.on('connection', function(socket) {
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', messages);

  // añadimos jugador nuevo
  n_jugadores = n_jugadores + 1;
  jugadores.push({
    id: n_jugadores.toString(),
    objeto_jugador: new Jugador("jugador_" + n_jugadores.toString(), "happy")
  });
  socket.emit('object_jugador', jugadores.find( jugador => jugador.id === n_jugadores.toString() ));

  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });

});

server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});