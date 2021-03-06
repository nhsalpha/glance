// experiment specific settings
breakElement = document.getElementById("break");
breakCounter = document.getElementById("break-remaining");

globalCount = 0;
seriesCount = 0;
halfwayFlag = false;
experimentLog = [];

sampleSize = 4; // should be 100
totalSize = (fonts.length * polarity.length) * sampleSize;
breakEvery = 2; // should be 50
breakDuration = 3000;  // should be 30 seconds

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
        //console.log('response: success');
      } else {
        window.location.href = '/error';
        //console.log('response: ERROR');
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

      if (seriesCount % breakEvery === 0 && seriesCount > 0) {
        // User gets a break of up to 30 seconds every 'breakEvery' trials

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
            breakElement.style.display = 'none';
            seriesCount = 0;
            return x();
          });

      }
      // if we're not having a break, run the next trial
      else {
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
            trialResult.correct = resolution.responseCorrect;
            experimentLog.push(trialResult);
            // if the response was actually correct:
            if (resolution.responseCorrect) {
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
            }
            // if the response was wrong or a timeout:
            else {
              if (exposureDuration < maxInterval) {
                exposureDuration = exposureDuration * 1.5;
                if (exposureDuration > maxInterval) {
                  exposureDuration = maxInterval;
                }
              }
              correctCount = 0;
            }
            seriesCount++;
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
