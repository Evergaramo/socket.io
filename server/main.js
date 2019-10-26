/**
*
* Busca:
*	mongodb
*	api rest models
*	API rest
*	API routes
*	mongoose
*
*/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const Jugador = require('./modules/jugador.js');
const Partida = require('./modules/partida.js');

// mongodb
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
//mongoose.createConnection('mongodb://localhost/partidas');


// api rest models
var models     = require('./models/partidaShow')(app, mongoose);
var PartidaShowCtrl = require('./controllers/partidaShows');

// iniciar express
app.use(express.static('public'));

// API rest
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// API routes
var partidasShows = express.Router();

partidasShows.route('/partidasshows')
  .get(PartidaShowCtrl.findAllPartidasShows)
  .post(PartidaShowCtrl.addPartidaShow);

/*app.get('/hello', function(req, res) {
  res.status(200).send("Hello World!");
});*/

app.use('/api', partidasShows);

// ARRAYS DINAMICOS
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
                  objeto_partida: new Partida(n_partidas.toString(), "partida_" + n_partidas.toString(), "", jugadores.find( jugador => jugador.id === '1' ).objeto_jugador, 40)
                  }];
jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.setPartida('1');
n_partidas=n_partidas+1;
partidas.push({id: n_partidas.toString(),
                  objeto_partida: new Partida(n_partidas.toString(), "partida_" + n_partidas.toString(), "123", jugadores.find( jugador => jugador.id === '2' ).objeto_jugador, 20)
                  });
jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.setPartida('2');

// array mensajes
var messages = [{
  id: 1,
  text: "Hola soy un mensaje",
  // buscamos su nombre
  author: jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.nombre
}];

//Socket principal de conexión
io.on('connection', function(socket) {
  console.log('Alguien se ha conectado con Sockets');

  // mensajes
  socket.emit('messages', messages);
  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });

  // jugadores
  // añadimos jugador si no hay nada en el html5 storage
  socket.on('anadir-jugador', function() {
    n_jugadores = n_jugadores + 1;
    jugadores.push({
      id: n_jugadores.toString(),
      objeto_jugador: new Jugador("jugador_" + n_jugadores.toString(), "happy")
    });
    // pasamos el jugador recien creado
    socket.emit('object_jugador', jugadores.find( jugador => jugador.id === n_jugadores.toString() ));
  });

  //partidas
  socket.emit('partidas', partidas);
  // unirse a partida
  socket.on('unirse-partida', function(data) {
    var partida = partidas.find( partida => partida.id === data.id_partida );
    var jugador = jugadores.find( jugador => jugador.id === data.id_jugador);
    var _respuesta = partida.objeto_partida.anadirJugador(jugador, data.id_jugador);
    var _html = partida.objeto_partida.getHTMLPartida();
    var _array_jugadores_en_juego = partida.objeto_partida.getArrayJugadoresEnJuego();
    // hay tres respuestas (ver modulo partida)
    if(_respuesta === 1){
      //actualizar n jugadores
      jugador.objeto_jugador.setPartida(data.id_partida);
      io.sockets.emit('partidas', partidas);
    }
    data = {
      respuesta: _respuesta,
      partida: partida.objeto_partida,
      html: _html,
      array_jugadores_en_juego: _array_jugadores_en_juego
    };
    io.sockets.emit('jugar', data);
  });
  // comprobar password si tiene
  socket.on('validar-pass', function(data) {
    var jugador = jugadores.find( jugador => jugador.id === data.id_jugador);
    var partida = partidas.find( partida => partida.id === data.id_partida );
    var _respuesta = partida.objeto_partida.comprobar_pass(data.pass, data.jugador, data.id_jugador);
    var _html = partida.objeto_partida.getHTMLPartida();
    var _array_jugadores_en_juego = partida.objeto_partida.getArrayJugadoresEnJuego();
    // hay tres respuestas (ver modulo partida)
    if(_respuesta === 1){
      jugador.objeto_jugador.setPartida(data.id_partida);
      io.sockets.emit('partidas', partidas);
    }
    data = {
      respuesta: _respuesta,
      partida: partida.objeto_partida,
      html: _html,
      array_jugadores_en_juego: _array_jugadores_en_juego
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
  //juego
  socket.on('mover', function(data) {
    var partida = partidas.find( partida => partida.id === data.id_partida );
    var estado = partida.objeto_partida.estado;
    if(estado === 0 || estado === 2){
      data = {
        estado: estado,
        id_jugador: data.id_jugador
      }
      io.sockets.emit('respuesta-movimiento', data);
    }
    else if(estado === 1) {
      var tuTurno = partida.objeto_partida.tuTurno(data.id_jugador);
      if(tuTurno === false){
        data = {
          estado: estado,
          tuTurno: tuTurno,
          id_jugador: data.id_jugador
        }
        io.sockets.emit('respuesta-movimiento', data);
      }else{
        var puedoMover = partida.objeto_partida.puedoMover(data.celda);
        if(puedoMover === false){
          data = {
            estado: estado,
            tuTurno: tuTurno,
            puedoMover: puedoMover,
            id_jugador: data.id_jugador
          }
          io.sockets.emit('respuesta-movimiento', data);
        }
        else{
          partida.objeto_partida.setCelda(data.celda, data.figura);
          var html = partida.objeto_partida.getHTMLtabla();
          var fin = partida.objeto_partida.final();
		  var o_partida = partida.objeto_partida;
          data = {
            estado: estado,
            tuTurno: tuTurno,
            puedoMover: puedoMover,
            html: html,
            fin: fin,
            id_jugador: data.id_jugador,
			//para AJAX POST
			id_partida: o_partida.getID(),
			nombre: o_partida.getNombre(),
			id_jug1: o_partida.getJug1(),
			id_jug2: o_partida.getJug2()
          }
          io.sockets.emit('respuesta-movimiento', data);
        }
      }
    }
  });
});

// conectamos con MongoDB e iniciamos el servidor
mongoose.connect('mongodb://localhost/partidaShow', function(err, res){
	if(err){
		console.log('ERROR: connecting to Database. ' + err);
	}
});

server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});