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
    //partida
    this.estado = 0;//0 -> no ha empezado || 1 -> en juego || 2 -> finalizada
    this.turno = 0;//de quien es el turno; 1 -> jug1 || 2 -> jug2
    this.jug_nec = 2;//jugadores necesarios
    this.ids_jug = [];//ids de los dos jugadores
    //tabla
    this.tabla = [0,0,0,0,0,0,0,0,0];
  }

  anadirJugador(jugador, id_jugador) {
  	if(this.n_jug < this.max_jug){
  		if(this.pass === ''){
  			this.n_jug = this.n_jug + 1;
		  	this.jugadores.push({id: this.n_jug,
		                  objeto_jugador: jugador
		                  });
		  	this.iniciar_partida(id_jugador);
		  	return 1;//insertado
	  	}
	  	else
	  		return 3;//necesitas contraseña
  	}
  	else
  		return 2;//max jugadores alcanzado
  }

  comprobar_pass(pass, jugador, id_jugador){
  	if(this.pass === pass){
  		if(this.n_jug >= this.max_jug)
  			return 2;//max jugadores alcanzados
  		else{
  			this.n_jug = this.n_jug + 1;
  			this.jugadores.push({id: this.n_jug,
		                  objeto_jugador: jugador
		                  });
  			this.iniciar_partida(id_jugador);
  			return 1;//insertado
  		}
  	}
  	else
  		return 3;//contraseña no valida
  }

  iniciar_partida(id_jugador){
  	if(this.jug_nec > 0){
  		this.jug_nec--;
	  	this.ids_jug.push(id_jugador);
	  	if(this.jug_nec <= 0){
	  		this.estado = 1;
  			this.turno = 1;
	  	}
	  }
  }

  eliminarJugador(id_jugador){
  	this.jugadores.slice(id_jugador);
  	this.n_jug = this.n_jug - 1;
  }

  getHTMLPartida(){
    var html = '<div id="bienvenido"><h5>Bienvenido a la partida ' + this.nombre + '</h5></div>';
    html += '<div id="juego">';
    html += '<div id="tablero">';
    html += this.getHTMLtabla();
    html += '</div>';
    return html;
  }

  tuTurno(id_jugador){
  	var turno_jugador = this.ids_jug[this.turno-1];
  	if(turno_jugador === id_jugador)
  		return true
  	else
  		return false
  }

  puedoMover(id_celda){
  	var n_celda = this.idToN(id_celda);
  	if(this.tabla[n_celda] === 0)
  		return true;
  	else
  		return false;
  }

  setCelda(id_celda, figura){
  	var n_celda = this.idToN(id_celda);
  	if(figura === 'figura1')
  		this.tabla[n_celda] = 1;
  	else if(figura === 'figura2')
  		this.tabla[n_celda] = 2;
    //cambiamos de turno
    if(this.turno == 1)
      this.turno = 2;
    else if(this.turno == 2)
      this.turno = 1;
  }

  idToN(id_celda){
  	switch (id_celda) {
  	  case 'A1':
  	    return 0;
  	  case 'A2':
  	    return 1;
  	  case 'A3':
  	    return 2;
  	  case 'B1':
  	    return 3;
  	  case 'B2':
  	    return 4;
  	  case 'B3':
  	    return 5;
  	  case 'C1':
  	    return 6;
  	  case 'C2':
  	    return 7;
  	  case 'C3':
  	    return 8;
  	  default:
  	    return 0;
  	}
  }

  getHTMLtabla(){
    var html = '<div class="fila">'+
          this.getHTMLcelda('A1', this.tabla[0])+
          this.getHTMLcelda('A2', this.tabla[1])+
          this.getHTMLcelda('A3', this.tabla[2])+
        '</div>'+
        '<div class="fila">'+
          this.getHTMLcelda('B1', this.tabla[3])+
          this.getHTMLcelda('B2', this.tabla[4])+
          this.getHTMLcelda('B3', this.tabla[5])+
        '</div>'+
        '<div class="fila">'+
          this.getHTMLcelda('C1', this.tabla[6])+
          this.getHTMLcelda('C2', this.tabla[7])+
          this.getHTMLcelda('C3', this.tabla[8])+
        '</div>';
  	return html;
  }

  getHTMLcelda(id_celda, n){
    switch (n) {
      case 0:
        return '<div id="'+ id_celda +'" class="columna" ondrop="dropFigura(event)" ondragover="allowDropFigura(event)"></div>';
      case 1:
        return '<div id="'+ id_celda +'" class="columna"><img style="vertical-align: baseline;" src="img/cross.png" draggable="false"></div>';
      case 2:
        return '<div id="'+ id_celda +'" class="columna"><img style="vertical-align: baseline;" src="img/circle.png" draggable="false"></div>';
      default:
        return '<div id="'+ id_celda +'" class="columna" ondrop="dropFigura(event)" ondragover="allowDropFigura(event)"></div>';
    }
  }

  final(){
    var r = false;
    if( (this.tabla[0] == this.tabla[1]) && (this.tabla[0] == this.tabla[2]) && (this.tabla[0] !== 0) ){ //Primera fila
        r = true;
    }else if( (this.tabla[3] == this.tabla[4]) && (this.tabla[3] == this.tabla[5]) && (this.tabla[3] !== 0) ){ //Segunda fila
        r = true;
    }else if( (this.tabla[6] == this.tabla[7]) && (this.tabla[6] == this.tabla[8]) && (this.tabla[6] !== 0) ){ //Tercera fila
        r = true;
    }else if( (this.tabla[0] == this.tabla[3]) && (this.tabla[0] == this.tabla[6]) && (this.tabla[0] !== 0) ){ //Primera columna
        r = true;
    }else if( (this.tabla[1] == this.tabla[4]) && (this.tabla[1] == this.tabla[7]) && (this.tabla[1] !== 0) ){ //Segunda columna
        r = true;
    }else if( (this.tabla[2] == this.tabla[5]) && (this.tabla[2] == this.tabla[8]) && (this.tabla[2] !== 0) ){ //tercera columna
        r = true;
    }else if( (this.tabla[0] == this.tabla[4]) && (this.tabla[0] == this.tabla[8]) && (this.tabla[0] !== 0) ){ //Primera diagonal
        r = true;
    }else if( (this.tabla[6] == this.tabla[4]) && (this.tabla[6] == this.tabla[2]) && (this.tabla[6] !== 0) ){ //Segunda diagonal
        r = true;
    }
    if(r === true)
      this.estado = 2;
    return r;
  }

  getArrayJugadoresEnJuego(){
    return this.ids_jug;
  }
  
  //AJAX
  
  getID(){
	  return this.id;
  }
  
  getNombre(){
	  return this.nombre;
  }
  
  getJug1(){
	  //return this.jugadores.find( jugador => jugador.id === '1' ).objeto_jugador.nombre;
	  return 'jugador1';
  }
  
  getJug2(){
	  //return this.jugadores.find( jugador => jugador.id === '2' ).objeto_jugador.nombre;
	  return 'jugador2';
  }

}

module.exports = Partida;