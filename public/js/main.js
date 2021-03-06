/**
*
* Busca:
*	AJAX -> get
*	AJAX -> post
*
*/


const socket = io.connect('http://localhost:8080', { 'forceNew': true });

/**
* Jugador
*
*/

var id_jugador;
var jugador_data;
var id_partida;

// html5 storage
if (typeof(Storage) !== "undefined") {  
  id_jugador = localStorage.getItem("last_id_jugador");
  jugador_data = localStorage.getItem("last_jugador_data");
  id_partida = localStorage.getItem("last_id_partida");
  if(id_jugador === null || jugador_data === null || id_partida === null)
    socket.emit('anadir-jugador');
  else{
    /*data = {
      id: id_jugador,
      objeto_jugador: jugador_data
    }
    //render_jugador(data);
    unirsePartida(id_partida);*/
    socket.emit('anadir-jugador');
  }
} else {
  socket.emit('anadir-jugador');
}



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

  // jugador storage
  localStorage.setItem("last_id_jugador", data.id);   
  localStorage.setItem("last_jugador_data", data.objeto_jugador);

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

//AJAX -> get
async function recibir() {
	let url = 'http://localhost:8080/partidasshows';
	let response = await fetch(url);
	let partidas = await response.json(); // read response body and parse
	var html_partidas = '<table>';
	'<thead>'+
          '<tr>'+
            '<th>dia'+
            '</th>'+
            '<th>Nombre'+
            '</th>'+
            '<th>Id Partida'+
            '</th>'+
			'<th>Jugador 1'+
            '</th>'+
            '<th>Jugador 2'+
            '</th>'+
            '<th>Id ganador'+
            '</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>';
	for (var i = 0; i < partidas.length; i++) {
		var dia = partidas[i].dia;
		var nombre = partidas[i].nombre;
		var id_partida = partidas[i].id_partida;
		var nombre_jug1 = partidas[i].nombre_jug1;
		var nombre_jug2 = partidas[i].nombre_jug2;
		var id_ganador = partidas[i].id_ganador;
		html_partidas+='<tr>';
		html_partidas+='<th>';
		html_partidas+=dia;
		html_partidas+='</th>';
		html_partidas+='<th>';
		html_partidas+=nombre;
		html_partidas+='</th>';
		html_partidas+='<th>';
		html_partidas+=id_partida;
		html_partidas+='</th>';
		html_partidas+='<th>';
		html_partidas+=nombre_jug1;
		html_partidas+='</th>';
		html_partidas+='<th>';
		html_partidas+=nombre_jug2;
		html_partidas+='</th>';
		html_partidas+='<th>';
		html_partidas+=id_ganador;
		html_partidas+='</th>';
		html_partidas+='</tr>';
	}
    html_partidas += '</tbody></table>';
	document.getElementById('historial').innerHTML = html_partidas;
}
recibir();

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
  //Así no se verán afectados todas las conexiones (léase pestañas), sólo la que tiene el mismo id de partida
  if(id_partida === data.partida.id){
    if(data.respuesta === 1){
      jugar(data.partida, data.html, data.array_jugadores_en_juego);
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
    jugar(data.partida, data.html, data.array_jugadores_en_juego);
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

function jugar(partida, html, array_jugadores_en_juego){
  // storage partida
  localStorage.setItem("last_id_partida", partida.id);

  var jug1 = array_jugadores_en_juego[0];
  if(jug1 === id_jugador){
    html += '<div id="figura">';
    html += '<img style="margin: 65px 130px"; id="figura1" src="img/cross.png" draggable="true" ondragstart="dragFigura(event)">';
    html += '</div>';
  }
  var jug2 = array_jugadores_en_juego[1];
  if(jug2 === id_jugador){
    html += '<div id="figura">';
    html += '<img style="margin: 65px 130px"; id="figura2" src="img/circle.png" draggable="true" ondragstart="dragFigura(event)">';
    html += '</div>';
  }
  html += '</div>';
  html += '<div id="salir"><button onclick="desplegar_menu()">salir</button></div>';
  if(id_jugador != jug1 && id_jugador != jug2)
    html += '<br><h5 id="visitante">Has entrado en la sala cómo visitante</h5>';
  document.getElementById('contenedor_partida').innerHTML = html;
  document.getElementById('contenedor_partida').style.display = "block";
  document.getElementById('contenedor_menu').style.display = "none";
  document.getElementById('contenedor_chat').style.display = "none";
  // si el jugador se mete una vez terminada la partida
  if(partida.estado === 2)
    alert('La partida ha terminado');
}

/**
* Juego
*
*/
function allowDropFigura(ev) {
  ev.preventDefault();
}

function dragFigura(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dropFigura(ev) {
  ev.preventDefault();
  var figura = ev.dataTransfer.getData("text");


  data = {
    id_jugador: id_jugador,
    id_partida: id_partida,
    figura: figura,
    celda: event.target.id
  }

  socket.emit('mover', data);
  /*if(data=='figura1')
    html = '<img style="vertical-align: baseline;" src="img/cross.png" draggable="false">';
  else if(data=='figura2')
    html = '<img style="vertical-align: baseline;" src="img/circle.png" draggable="false">';
  document.getElementById(event.target.id).innerHTML = html;
  var elem = document.getElementById(event.target.id);
  elem.setAttribute('draggable', false);*/
}

socket.on('respuesta-movimiento', function(data) {
  var estado = data.estado;
  if(estado === 0){
    if(id_jugador === data.id_jugador)
      alert('Aún no hay jugadores suficientes');
  }
  else if(estado === 2){
    if(id_jugador === data.id_jugador)
      alert('La partida ha terminado');
  }
  else if(estado === 1){
    if(data.tuTurno === false){
      if(id_jugador === data.id_jugador)  
        alert('no es tu turno');
    }
    else{
      if(data.puedoMover === true){
        var html = data.html;
        document.getElementById('tablero').innerHTML = html;
        if(data.fin === true){
          alert('fin de la partida');
          if(id_jugador === data.id_jugador){
            alert('¡has ganado!');
			
			//AJAX -> post
			async function enviar() {
				let partida = {
					dia : new Date(),
					id_partida : data.id_partida,
					nombre : data.nombre,
					nombre_jug1 : data.id_jug1,
					nombre_jug2 : data.id_jug2,
					id_ganador : id_jugador
				}
				let response =  await fetch('http://localhost:8080/partidasshows', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json;charset=utf-8'
					},
					body: JSON.stringify(partida)
				});
				let result = await response.json();
				alert(result.message);
			}
		  }
        }
      }
    }
  }
});

/**
* Fin de la conexión
*
**/
/*socket.close(
  socket.emit('eliminar-jugador', id_jugador);
);*/