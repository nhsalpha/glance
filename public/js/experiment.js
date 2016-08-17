// Environmental conditions - polarity, fonts we're testing...
var experimentalConditions = function() {
  var conditions = [];

  polarity = shuffleArray(polarity);
  for (var i = 0; i < polarity.length; ++i) {
    fonts = shuffleArray(fonts);

    for (var j = 0; j < fonts.length; ++j) {
      conditions.push(polarity[i] + " " + fonts[j]);
    }
  }

  return conditions;
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

// Run series of trials, with changing "step duration":
var runSeries = function(words, state) {
  var correctCount = 0;
  var words = words.slice(0);
  var exposureDuration = maxInterval;
  var x = function x() {
    if (words.length > 0) {

      var whichPromise;

      if (globalCount % breakEvery === 0 && globalCount > 0) {
        var count = breakDuration/1000;
        breakCounter.textContent = count;
        breakElement.style.display = 'block';

        whichPromise = new Promise(function(resolve) {

          breakListener = function(event) {
            document.removeEventListener("keydown", breakListener);
            resolve('User keyed');
          };

          document.addEventListener("keydown", breakListener);

          var timer = window.setInterval(function() {
            if (count > 0) {
              count--;
              breakCounter.textContent = count;
            } else if (count === 0) {
              clearInterval(timer);
              document.removeEventListener("keydown", breakListener);
              resolve('Timer reached end');
            }
          }, 1000);
        })
          .then(function(str) {
            console.log(str);
            breakElement.style.display = 'none';
            globalCount = 0;
            return x();
          });

      } else {
        var nextWord = words.shift();
        var trialResult = {
          word: nextWord.text,
          real: nextWord.real,
          duration: exposureDuration,
          state: state
        };
        whichPromise = runTrial(nextWord, exposureDuration).then(
          // Promise - success resolution
          function(resolution) {
            trialResult.response = resolution.response;
            trialResult.responseTime = resolution.responseTime;
            trialResult.correct = true;
            experimentLog.push(trialResult);
            if (exposureDuration > minInterval && correctCount === 3) {
              exposureDuration = exposureDuration * 0.75;
              if (exposureDuration < minInterval) {
                exposureDuration = minInterval;
              }
            }
            if (correctCount === 3) {
              correctCount = 0;
            } else {
              correctCount++;
            }
            globalCount++;
            return x();
          },
          // Promise - fail resolution
          function(resolution) {
            trialResult.response = resolution.response;
            trialResult.responseTime = resolution.responseTime;
            trialResult.correct = false;
            experimentLog.push(trialResult);
            if (exposureDuration < maxInterval) {
              exposureDuration = exposureDuration * 1.5;
              if (exposureDuration > maxInterval) {
                exposureDuration = maxInterval;
              }
            }
            correctCount = 0;
            globalCount++;
            return x();
          }
        );
      }
      return whichPromise;
    } else {
      return true;
    }
  };
  return x();
};

// The whole experiment - all font and polarity combinations
var runExperiment = function() {
  var x = function() {
    if (conditions.length > 0) {
      var state = conditions.shift();
      document.body.className = state;
      return runSeries(shuffleArray(wordList), state).then(x);
    } else {
      return true;
    }
  };
  return x();
};

// Generate the conditions for the experiment:
var conditions = experimentalConditions();
// Generate the word list
var wordList = generateRandomWordList(sampleSize);

runExperiment()
  .then(saveResults);
