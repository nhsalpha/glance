// ----------------------- Glance test -----------------------

// Trial part 1: show rectangle frame
var showFixationRectangle = function() {
  container.className = "fixation-rectangle";

  return timeoutPromise(1000);
};

// Trial parts 2 and 4: show mask characters
var showMask = function() {
  var mask = '';
  for (var i=0; i<= wordLength; i++) {
    mask += nonLetterCharacters[Math.floor(Math.random() * nonLetterCharacters.length)];
  }
  maskElement.textContent = mask;

  container.className = "mask";

  return timeoutPromise(200);
};

// Trial part 3: show word (or pseudo word)
var showWord = function(word, exposureDuration) {
  wordElement.textContent = word;
  container.className = "word";

  return timeoutPromise(exposureDuration);
};

// Trial part 4: "Was that a word?" user response
var awaitResponse = function(real) {
  container.className = "prompt";

  var listener;
  var promise = new Promise(function(fulfill, reject) {

    var startTime = Date.now();
    var resolution = {
      response: 'timeout',
      responseCorrect: 'timeout'
    };

    window.setTimeout(function() {
      resolution.responseTime = Date.now() - startTime;
      resolution.response = 'timeout';
      resolution.responseCorrect = 'timeout';
      fulfill(resolution);
    }, responseTimeout);

    listener = function(event) {

      resolution.responseTime = Date.now() - startTime;

      if (event.keyCode === 81) {
        resolution.response = "real";
        resolution.responseCorrect = real ? true : false;
        //real ? fulfill(resolution) : reject(resolution);
      }
      else if (event.keyCode === 80) {
        resolution.response = "pseudo";
        resolution.responseCorrect = real ? false : true;
        //real ? reject(resolution) : fulfill(resolution);
      }

      fulfill(resolution);

    };

    document.addEventListener("keydown", listener);
  });

  promise.then(
    function() {
      document.removeEventListener("keydown", listener);
    },
    function() {
      document.removeEventListener("keydown", listener);
    }
  );

  return promise;
};

// Chain trial events together:
var runTrial = function(word, exposureDuration) {
  return showFixationRectangle()
    .then(showMask)
    .then(function() { return showWord(word.text, exposureDuration); })
    .then(showMask)
    .then(function() {
      return awaitResponse(word.real);
    });
};
