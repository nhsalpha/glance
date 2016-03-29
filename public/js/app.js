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
    window.setTimeout(function() { reject("timeout"); }, 5000);

    listener = function(event) {
      if (event.keyCode === 81) {
        real ? fulfill("real") : reject("real");
      }
      else if (event.keyCode === 80) {
        real ? reject("pseudo") : fulfill("pseudo");
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
      log = [],
      exposureDuration = 1000,
      x = function x() {
        if (words.length > 0) {
          var nextWord = words.shift(),
              trialResult = {
                word: nextWord.text,
                real: nextWord.real,
                duration: exposureDuration
              };

          return runTrial(nextWord, exposureDuration).then(
            function(response) {
              trialResult.response = response;
              log.push(trialResult);

              exposureDuration = exposureDuration * 0.75;
              return x();
            },
            function(response) {
              trialResult.response = response;
              log.push(trialResult);

              exposureDuration = exposureDuration * 1.5;
              return x();
            }
          );
        }
        else {
          return log;
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

runSeries(wordList).then(function(log) {
  console.log(log);
});
