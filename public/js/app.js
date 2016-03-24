var init = function() {
  //set up stage
}

var showFixationRectangle = function() {

};

var showMask = function() {
  document.getElementById('mask')
};

var showWord = function() {
  
};

var awaitResponse = function() {

};

var runTrial = function(word) {
  return showFixationRectangle()
    .then(showMask)
    .then(function() { return showWord(word, exposureDuration)); })
    .then(showMask)
    .then(awaitResponse)
}

runTrial("fart");

//document.getElementById('word').innerHTML(word);
