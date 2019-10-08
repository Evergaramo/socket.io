class Partida {
  constructor(id, nombre, pass, jugador, max) {
    this.id = id;
    this.nombre = nombre;
    this.pass = pass;
    this.n_jug = 1;
    this.jugadores = [{id: this.n_jug,
                  objeto_jugador: jugador
                  }];
    this.max_jug = max;
  }

  anadirJugador(jugador) {
  	if(this.n_jug < this.max_jug){
  		if(this.pass === ''){
  			this.n_jug = this.n_jug + 1;
		  	this.jugadores.push({id: this.n_jug,
		                  objeto_jugador: jugador
		                  });
		  	return 1;//insertado
	  	}
	  	else
	  		return 3;//necesitas contraseña
  	}
  	else
  		return 2;//max jugadores alcanzado
  }

  comprobar_pass(pass, jugador){
  	if(this.pass === pass){
  		if(this.n_jug >= this.max_jug)
  			return 2;//max jugadores alcanzados
  		else{
  			this.n_jug = this.n_jug + 1;
  			this.jugadores.push({id: this.n_jug,
		                  objeto_jugador: jugador
		                  });
  			return 1;//insertado
  		}
  	}
  	else
  		return 3;//contraseña no valida
  }

  eliminarJugador(id_jugador){
  	this.jugadores.slice(id_jugador);
  	this.n_jug = this.n_jug - 1;
  }
}

module.exports = Partida;