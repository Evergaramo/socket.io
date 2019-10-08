var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const Jugador = require('./modules/jugador.js');
const Partida = require('./modules/partida.js');

// array jugadores
var n_jugadores = 1;
var jugadores = [{id: n_jugadores.toString(),
                  objeto_jugador: new Jugador("Carlos Azaustre", "")
                  }];
n_jugadores=n_jugadores+1;
jugadores.push({id: n_jugadores.toString(),
                  objeto_partida: new Jugador("Pablo", "")
                  });

//array partidas
var n_partidas = 1;
var partidas = [{id: n_partidas.toString(),
                  objeto_partida: new Partida(n_partidas.toString(), "partida_" + n_partidas.toString(), "", jugadores.find( jugador => jugador.id === '1' ).objeto_jugador, 4)
                  }];
jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.setPartida('1');
n_partidas=n_partidas+1;
partidas.push({id: n_partidas.toString(),
                  objeto_partida: new Partida(n_partidas.toString(), "partida_" + n_partidas.toString(), "123", jugadores.find( jugador => jugador.id === '2' ).objeto_jugador, 2)
                  });
jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.setPartida('2');

// array mensajes
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

  // mensajes
  socket.emit('messages', messages);
  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });

  // jugadores
  // añadimos jugador
  n_jugadores = n_jugadores + 1;
  jugadores.push({
    id: n_jugadores.toString(),
    objeto_jugador: new Jugador("jugador_" + n_jugadores.toString(), "happy")
  });
  // pasamos el jugador recien creado
  socket.emit('object_jugador', jugadores.find( jugador => jugador.id === n_jugadores.toString() ));
  
  //partidas
  socket.emit('partidas', partidas);
  // unirse a partida
  socket.on('unirse-partida', function(data) {
    var partida = partidas.find( partida => partida.id === data.id_partida );
    var jugador = jugadores.find( jugador => jugador.id === data.id_jugador);
    var _respuesta = partida.objeto_partida.anadirJugador(jugador);
    // hay tres respuestas (ver modulo partida)
    if(_respuesta === 1){
      jugador.objeto_jugador.setPartida(data.id_partida);
      io.sockets.emit('partidas', partidas);
    }
    data = {
      respuesta: _respuesta,
      partida: partida.objeto_partida
    };
    io.sockets.emit('jugar', data);
  });
  // comprobar password si tiene
  socket.on('validar-pass', function(data) {
    var jugador = jugadores.find( jugador => jugador.id === data.id_jugador);
    var partida = partidas.find( partida => partida.id === data.id_partida );
    var _respuesta = partida.objeto_partida.comprobar_pass(data.pass, data.jugador);
    // hay tres respuestas (ver modulo partida)
    if(_respuesta === 1){
      jugador.objeto_jugador.setPartida(data.id_partida);
      io.sockets.emit('partidas', partidas);
    }
    data = {
      respuesta: _respuesta,
      partida: partida.objeto_partida
    };
    io.sockets.emit('respuesta-pass', data);
  });
  // salir-partida
  socket.on('salir-partida', function(data) {
    var partida = partidas.find( partida => partida.id === data.id_partida );
    partida.objeto_partida.eliminarJugador(data.id_jugador);
    var jugador = jugadores.find( jugador => jugador.id === data.id_jugador);
    jugador.objeto_jugador.setPartida('');
    //eliminar la partida si no hay jugadores
    if(partida.objeto_partida.n_jug < 1)
      jugadores.slice(partida.objeto_partida.id);
    io.sockets.emit('partidas', partidas);
  });
});

server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});