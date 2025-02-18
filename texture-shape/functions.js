// Code to load node io process as Socket
socket = io.connect();
save_trial_to_database = function(trial_data){
  socket.emit('insert', trial_data)
}

var randint = function(max) {
  return Math.floor(Math.random() * max);
}

var randShuffleInPlace = function(arr) {
  // Fisher-Yates (Knuth) shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randint(i+1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

var randSampleWithoutReplacement = function(size, min, max) {
  const range = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }

  var arr = randShuffleInPlace(range);
  return arr.slice(0, size);
}

var zeroPad = (num, places) => String(num).padStart(places, '0');
