const socket = io.connect('http://localhost:8080', { 'forceNew': true });

/**
* Jugador
*
*/

var id_jugador;
var jugador_data;
var id_partida;

// recibimos info del objeto jugador añadido
socket.on('object_jugador', function(data) {
  console.log(data);
  render_jugador(data);
})

// sacar info del jugador
function render_jugador (data) {
  id_jugador = data.id;
  jugador_data = data.objeto_jugador;
  var html = `<div class='logo form-group'>
              <img id='icono_jugador' src='icons/${data.objeto_jugador.icono}.svg' class='icon' draggable="true" ondragstart="drag(event)"/>
            </div>
            <div class='logo form-group'>
              <h3>${data.objeto_jugador.nombre}</h3>
            </div>`;

  document.getElementById('usuario').innerHTML = html;
}

/**
* Mensajes
*
*/

// recibimos los mensajes
socket.on('messages', function(data) {
  console.log(data);
  render_mensajes(data);
})

function render_mensajes (data) {
  var html = data.map(function(elem, index) {
    return(`<div>
              <strong>${elem.author}</strong>:
              <em>${elem.text}</em>
            </div>`);
  }).join(" ");

  document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {
  var message = {
    author: jugador_data.nombre,
    text: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  return false;
}

/**
* Partidas
*
*/

//recibimos las partidas
socket.on('partidas', function(data) {
  console.log(data);
  render_partidas(data);
})

function render_partidas (data) {

  var html_partidas = data.map(function(elem, index) {
    return(`<tr class="${elem.id}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <td class="${elem.id}" >${elem.objeto_partida.nombre}</td>
            <td class="${elem.id}" >${elem.objeto_partida.n_jug}/${elem.objeto_partida.max_jug}</td>
            <td class="${elem.id}" >100</td>
          </tr>`);
  }).join(" ");


  var html_table = '<table id="dtBasicExample" class="table table-sm table-striped table-hover table-bordered table-wrapper-scroll-y my-custom-scrollbar" cellspacing="0" width="100%">'+
        '<thead>'+
          '<tr>'+
            '<th class="th-sm">Nombre'+
            '</th>'+
            '<th class="th-sm">Jugadores'+
            '</th>'+
            '<th class="th-sm">Ping'+
            '</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>';
        html_table += html_partidas;
        html_table += '</tbody>'+
          '<tfoot>'+
            '<tr>'+
              '<th>Nombre'+
              '</th>'+
              '<th>Jugadores'+
              '</th>'+
              '<th>Ping'+
              '</th>'+
            '</tr>'+
          '</tfoot>'+
        '</table>'

  document.getElementById('tabla_partidas').innerHTML = html_table;
}

function unirsePartida(id_partida) {
  var data = {
    id_partida: id_partida,
    id_jugador: id_jugador
  };

  socket.emit('unirse-partida', data);
  return false;
}


// drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.childElementCount);
}

function drop(ev) {
  ev.preventDefault();
  id_partida = event.target.className;
  unirsePartida(id_partida);
}


/**
* Jugar
*
**/
socket.on('jugar', function(data) {
  if(data.respuesta === 1){
    jugar(data.partida);
  }
  else if(data.respuesta === 2){
    alert('Max jugadores alcanzado');
  }
  else if(data.respuesta === 3){
    html = '<h4>Introduce contraseña:</h4>'+
      '<input type="password" id="pass"/>'+
      '<button onclick="validar()">Enviar</button>'+
      '<br>'+
      '<button onclick="desplegar_menu()">Volver Atrás</button>';
    document.getElementById('contenedor_partida').innerHTML = html;
    document.getElementById('contenedor_partida').style.display = "block";
    document.getElementById('contenedor_menu').style.display = "none";
    document.getElementById('contenedor_chat').style.display = "none";
  }
})

function validar(){
  var pass = document.getElementById('pass').value;
  var data = {
    id_partida: id_partida,
    id_jugador: id_jugador,
    pass: pass
  };
  socket.emit('validar-pass', data);
}

socket.on('respuesta-pass', function(data) {
  if(data.respuesta === 1){
    jugar(data.partida);
  }
  else if(data.respuesta === 2){
    alert('Max jugadores alcanzado');
  }
  else if(data.respuesta === 3){
    html = '<h4>Introduce contraseña:</h4>'+
      '<input type="password" id="pass"/>'+
      '<button onclick="validar()">Enviar</button>'+
      '<h3>Password incorrecta</h3>'+
      '<br>'+
      '<button onclick="desplegar_menu()">Volver Atrás</button>';
    document.getElementById('contenedor_partida').innerHTML = html;
    document.getElementById('contenedor_partida').style.display = "block";
    document.getElementById('contenedor_menu').style.display = "none";
    document.getElementById('contenedor_chat').style.display = "none";
  }
})

function desplegar_menu(){
  document.getElementById('contenedor_partida').style.display = "none";
    document.getElementById('contenedor_menu').style.display = "block";
    document.getElementById('contenedor_chat').style.display = "block";
}

function salir(){
  var data = {
    id_partida: id_partida,
    id_jugador: id_jugador
  };
  socket.emit('salir-partida', data);
  desplegar_menu();
}

function jugar(partida){
  html = '<h1>Bienvenido a la partida ' + partida.nombre + '</h1>'+
    '<button onclick="desplegar_menu()">salir</button>';
    document.getElementById('contenedor_partida').innerHTML = html;
    document.getElementById('contenedor_partida').style.display = "block";
    document.getElementById('contenedor_menu').style.display = "none";
    document.getElementById('contenedor_chat').style.display = "none";
}

/**
* Fin de la conexión
*
**/
/*socket.close(
  socket.emit('eliminar-jugador', id_jugador);
);*/