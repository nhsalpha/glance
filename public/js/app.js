var init = function() {
  //set up stage
}

container = document.getElementById("container");
maskElement = document.getElementById("mask");
wordElement = document.getElementById("word");
wordLength = 6;

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

  var mask = '';
  for (var i=0; i<= wordLength; i++) {
    mask += nonLetterCharacters[Math.floor(Math.random() * nonLetterCharacters.length)];
  }
  maskElement.textContent = mask;

  container.className = "mask";

  return timeoutPromise(200);
};

var showWord = function(word, exposureDuration) {
  wordElement.textContent = word;
  container.className = "word";

  return timeoutPromise(exposureDuration);
};

var awaitResponse = function(real) {
  container.className = "prompt";

  var listener;
  var promise = new Promise(function(fulfill, reject) {
    window.setTimeout(reject, 5000);

    listener = function(event) {
      console.log(event);

      if (event.code === "KeyQ") {
        real ? fulfill() : reject();
      }
      else if (event.code === "KeyP") {
        real ? reject() : fulfill();
      }
    };

    document.addEventListener("keydown", listener);
  });

  promise.then(
    function() { document.removeEventListener("keydown", listener); },
    function() { document.removeEventListener("keydown", listener); }
  );

  return promise;
};

var runTrial = function(word, exposureDuration) {
  return showFixationRectangle()
    .then(showMask)
    .then(function() { return showWord(word.text, exposureDuration); })
    .then(showMask)
    .then(function() { return awaitResponse(word.real); });
};

var runSeries = function(words) {
  var words = words.slice(0),
      exposureDuration = 1000,
      x = function x() {
        if (words.length > 0) {
          return runTrial(words.shift(), exposureDuration).then(
            function() {
              exposureDuration = exposureDuration * 0.75;
              return x();
            },
            function() {
              exposureDuration = exposureDuration * 1.5;
              return x();
            }
          );
        }
        else {
          return "DONE";
        }
      };

  return x();
};

var wordList = [
  {text: "farted", real: true},
  {text: "guffed", real: true},
  {text: "trumpe", real: false},
  {text: "parped", real: true},
  {text: "flufed", real: false}
];

runSeries(wordList).then(window.alert);
