class Jugador {
  constructor(cadena_nombre, svg_path) {
    this.nombre = cadena_nombre;
    this.icono = svg_path;
    this.id_partida = null;
  }

  setPartida(id_partida) {
  	this.id_partida = id_partida;
  }

}

module.exports = Jugador;
