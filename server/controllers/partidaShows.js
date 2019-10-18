//File: controllers/partidaShow.js
var mongoose = require('mongoose');
var PartidaShow  = mongoose.model('PartidaShow');

//GET - Return all partidaShow in the DB
exports.findAllPartidasShows = function(req, res) {
	PartidaShow.find(function(err, patidasshows) {
    if(err) res.send(500, err.message);

    console.log('GET /partidas')
		res.status(200).jsonp(patidasshows);
	});
};

//POST - Insert a new TVShow in the DB
exports.addPartidaShow = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var partidashow = new TVShow({
		dia:    req.body.dia,
		nombre: 	  req.body.nombre,
		id_partida:  req.body.id_partida,
		id_jug1:   req.body.id_jug1,
		id_jug2:  req.body.id_jug2,
		id_ganador:    req.body.id_ganador
	});

	partidashow.save(function(err, partidashow) {
		if(err) return res.status(500).send( err.message);
    res.status(200).jsonp(partidashow);
	});
};

