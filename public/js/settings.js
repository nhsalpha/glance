container = document.getElementById("container");
maskElement = document.getElementById("mask");
wordElement = document.getElementById("word");
breakElement = document.getElementById("break");
breakCounter = document.getElementById("break-remaining");

fonts = ["fs-me", "frutiger"];
polarity = ["polarity-normal", "polarity-reversed"];
sampleSize = 10;
wordLength = 6;
breakEvery = 5;
breakDuration = 10000;  // ms

maxInterval = 1000;
minInterval = 33.4;

responseTimeout = 5000;

globalCount = 0;
experimentLog = [];
