// Run series of trials, with changing "step duration":
var runQualifying = function(words) {
  var words = words.slice(0);
  var exposureDuration = 1000;
  var x = function x() {
    if (correctCount === 5) {
      window.location.href = '/experiment-intro';
    }
    if (words.length > 0) {
      var nextWord = words.shift();
      promise = runTrial(nextWord, exposureDuration).then(
        // Promise - success resolution
        function(resolution) {
          correctCount++;
          return x();
        },
        // Promise - fail resolution
        function(resolution) {
          correctCount = 0;
          return x();
        }
      );
    } else {
      if (round < 2) {
        correctCount = 0;
        initRound();
      } else {
        console.log('this is a fail');
        return true;
      }
    }
  };
  return x();
};

var round = 0;
var correctCount = 0;

var initRound = function () {
  round++;
  runQualifying(generateRandomWordList(10));
}

initRound();
