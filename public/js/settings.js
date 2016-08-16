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
breakDuration = 3000;  // ms

globalCount = 0;
experimentLog = [];
