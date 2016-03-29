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
    var startTime = Date.now();
    window.setTimeout(function() { reject({response: "timeout"}); }, 5000);

    listener = function(event) {
      var resolution = {
        response: undefined,
        responseTime: Date.now() - startTime
      };

      if (event.keyCode === 81) {
        resolution.response = "real";
        real ? fulfill(resolution) : reject(resolution);
      }
      else if (event.keyCode === 80) {
        resolution.response = "pseudo";
        real ? reject(resolution) : fulfill(resolution);
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
            function(resolution) {
              trialResult.response = resolution.response;
              trialResult.responseTime = resolution.responseTime;
              log.push(trialResult);

              exposureDuration = exposureDuration * 0.75;
              return x();
            },
            function(resolution) {
              trialResult.response = resolution.response;
              trialResult.responseTime = resolution.responseTime;
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

var generateRandomWordList = function(length) {
  var realSample = sampleArray(words, length / 2),
      pseudoSample = sampleArray(pseudoWords, length / 2);
      wordList = [];

  for (var i = 0; i < length / 2; ++i) {
    wordList.push({
      text: realSample[i],
      real: true
    });

    wordList.push({
      text: pseudoSample[i],
      real: false
    });
  }

  return shuffleArray(wordList);
};

var shuffleArray = function(array) {
  var i = array.length,
      value,
      swapIndex;

  array = array.slice(0);

  while (i > 0) {
    swapIndex = Math.floor(Math.random() * i);

    value = array[i - 1];
    array[i - 1] = array[swapIndex];
    array[swapIndex] = value;

    --i;
  }

  return array;
}

var sampleArray = function(array, sampleLength) {
  var i = array.length,
      value,
      swapIndex;

  array = array.slice(0);

  while (i > 0 && i >= array.length - sampleLength) {
    swapIndex = Math.floor(Math.random() * i);

    value = array[i];
    array[i] = array[swapIndex];
    array[swapIndex] = value;

    --i;
  }

  return array.slice(-sampleLength);
};

var wordList = generateRandomWordList(10);

runSeries(wordList).then(function(log) {
  console.log(log);
});
