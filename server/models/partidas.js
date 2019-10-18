var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var partidaShowSchema = new Schema({
  dia:    { type: Number },
  nombre:     { type: String },
  id_partida:  { type: String },
  id_jug1:   { type: String },
  id_jug2:  { type: String },
  id_ganador:    { type: String}// 0 si fue empate
});

module.exports = mongoose.model('PartidaShow', partidaShowSchema);
