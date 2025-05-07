// Code to load node io process as Socket
socket = io.connect();
save_trial_to_database = function(trial_data){
  socket.emit('insert', trial_data)
}

var randint = function(max) {
  return Math.floor(Math.random() * max);
}

var zeroPad = (num, places) => String(num).padStart(places, '0');
