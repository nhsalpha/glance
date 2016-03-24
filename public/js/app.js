var init = function() {
  //set up stage
}

container = document.getElementById("container");
maskElement = document.getElementById("mask");
wordElement = document.getElementById("word");

var timeoutPromise = function(duration) {
  return new Promise(function(fulfill, reject) {
    window.setTimeout(fulfill, duration);
  });
};

var showFixationRectangle = function() {
  container.className = "fixation-rectangle";

  return timeoutPromise(1000);
};

var showMask = function() {
  container.className = "mask";

  return timeoutPromise(200);
};

var showWord = function(word, exposureDuration) {
  wordElement.textContent = word;
  container.className = "word";

  return timeoutPromise(exposureDuration);
};

var awaitResponse = function() {
  container.className = "prompt";

  return timeoutPromise(5000);
};

var runTrial = function(word, exposureDuration) {
  return showFixationRectangle()
    .then(showMask)
    .then(function() { return showWord(word, exposureDuration); })
    .then(showMask)
    .then(awaitResponse);
}

runTrial("fart", 1000);

//document.getElementById('word').innerHTML(word);
