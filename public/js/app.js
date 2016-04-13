container = document.getElementById("container");
maskElement = document.getElementById("mask");
wordElement = document.getElementById("word");
wordLength = 6;
sampleSize = 2;
experimentLog = [];

// -------------------- Utility functions --------------------

var timeoutPromise = function(duration) {
  return new Promise(function(fulfill, reject) {
    window.setTimeout(fulfill, duration);
  });
};

// Shuffle an array
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


// -------------------- Glance test setup --------------------

// Generate the list of words for the trial:
var generateRandomWordList = function(length) {
  var realSample = sampleArray(words, length / 2),
      pseudoSample = sampleArray(pseudoWords, length / 2);
      wordList = [];

  // Push words to wordList array as objects
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

// Environmental conditions - polarity, fonts we're testing...
var experimentalConditions = function() {
  var fonts = ["fs-me", "frutiger"],
      polarity = ["polarity-normal", "polarity-reversed"],
      conditions = [];

  polarity = shuffleArray(polarity);
  for (var i = 0; i < polarity.length; ++i) {
    fonts = shuffleArray(fonts);

    for (var j = 0; j < fonts.length; ++j) {
      conditions.push(polarity[i] + " " + fonts[j]);
    }
  }

  return conditions;
};

// Get samples from the global word / pseudoWord arays:
var sampleArray = function(array, sampleLength) {
  var i = array.length,
      value,
      swapIndex;

  // Clone the passed in array:
  array = array.slice(0);

  // Shuffle it:
  while (i > 0 && i >= array.length - sampleLength) {
    swapIndex = Math.floor(Math.random() * i);

    value = array[i];
    array[i] = array[swapIndex];
    array[swapIndex] = value;

    --i;
  }

  // Send back the array, with sampleLength items:
  return array.slice(-sampleLength);
};

// Post experiment data to server and redirect
var saveResults = function() {
  var http = new XMLHttpRequest();
  var url = "/save-results";
  var data = JSON.stringify(experimentLog);
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/json");
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
      var response = JSON.parse(http.responseText);
      if (response.success === true) {
        window.location.href = '/complete';
      } else {
        window.location.href = '/error';
      }
    }
  }
  http.send(data);
}


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

// Chain trial events together:
var runTrial = function(word, exposureDuration) {
  return showFixationRectangle()
    .then(showMask)
    .then(function() { return showWord(word.text, exposureDuration); })
    .then(showMask)
    .then(function() { return awaitResponse(word.real); });
};

// Run series of trials, with changing "step duration":
var runSeries = function(words, state) {
  var words = words.slice(0),
      exposureDuration = 500,
      x = function x() {
        if (words.length > 0) {
          var nextWord = words.shift(),
              trialResult = {
                word: nextWord.text,
                real: nextWord.real,
                duration: exposureDuration,
                state: state
              };

          return runTrial(nextWord, exposureDuration).then(
            // Promise - success resolution
            function(resolution) {
              trialResult.response = resolution.response;
              trialResult.responseTime = resolution.responseTime;
              trialResult.correct = true;
              experimentLog.push(trialResult);

              exposureDuration = exposureDuration * 0.75;
              return x();
            },
            // Promise - fail resolution
            function(resolution) {
              trialResult.response = resolution.response;
              trialResult.responseTime = resolution.responseTime;
              trialResult.correct = false;
              experimentLog.push(trialResult);

              exposureDuration = exposureDuration * 1.5;
              return x();
            }
          );
        }
        else {
          return true;
        }
      };

  return x();
};

// The whole experiment - all font and polarity combinations
var runExperiment = function() {
  var conditions = experimentalConditions(),
      wordList = generateRandomWordList(sampleSize),
      x = function() {
        if (conditions.length > 0) {
          var state = conditions.shift();
          document.body.className = state;
          return runSeries(shuffleArray(wordList), state).then(x);
        }
        else {
          return true;
        }
      };

  return x();
};

// Run the experiment then post to server
runExperiment().then(saveResults);
