const socket = io.connect('http://localhost:8080', { 'forceNew': true });

// id del jugador
var id;
var jugador_data;

socket.on('messages', function(data) {
  console.log(data);
  render(data);
})

// devolvemos info del objeto jugador añadido
socket.on('object_jugador', function(data) {
  console.log(data);
  get_object(data);
})

function render (data) {
  var html = data.map(function(elem, index) {
    return(`<div>
              <strong>${elem.author}</strong>:
              <em>${elem.text}</em>
            </div>`);
  }).join(" ");

  document.getElementById('messages').innerHTML = html;
}

// sacar info del jugador
function get_object (data) {
  id = data.id;
  jugador_data = data.objeto_jugador;
  var html = `<div class='logo form-group'>
              <img id='icono_jugador' src='icons/${data.objeto_jugador.icono}.svg' class='icon' draggable="true"/>
            </div>
            <div class='logo form-group'>
              <h3>${data.objeto_jugador.nombre}</h3>
            </div>`;

  document.getElementById('usuario').innerHTML = html;
  var icon = document.querySelector("#icono_jugador");
  icon.addEventListener('dragstart', handleDragStart, false);
  icon.addEventListener('dragenter', handleDragEnter, false);
  icon.addEventListener('dragover', handleDragOver, false);
  icon.addEventListener('dragleave', handleDragLeave, false);
  icon.addEventListener('drop', handleDrop, false);
  icon.addEventListener('dragend', handleDragEnd, false);
}

function addMessage(e) {
  var message = {
    author: jugador_data.nombre,
    text: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  return false;
}


// drag and drop
var dragSrcEl = null;

function handleDragStart(e) {
  // Target (this) element is the source node.
  this.style.opacity = '0.4';

  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the columnwe dropped on.
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.

  [].forEach.call(cols, function (col) {
    col.classList.remove('over');
  });
}
