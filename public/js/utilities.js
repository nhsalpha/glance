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
