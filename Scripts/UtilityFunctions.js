app.scrambleText = function (text) {
    var scrambledText = "";
    var i;
    var randomIndex;
    var leftText;
    var rightText;
    var leftoverText = text;

    for (i = 1; i <= text.length; i++) {
        //Pick a random character out of leftoverText and append it to scrambledText
        randomIndex = Math.floor(Math.random() * leftoverText.length);
        leftText = leftoverText.substr(0, randomIndex);
        rightText = leftoverText.substr(randomIndex + 1, leftoverText.length - randomIndex - 1);
        scrambledText += leftoverText.substr(randomIndex, 1);
        leftoverText = leftText + rightText;
    }

    return scrambledText;
}

app.orderText = function (text) {
    var i;
    var txt = [];
    for (i = 0; i < text.length; i++) {
        txt[i] = text.substr(i, 1);
    }
    txt.sort();
    result = "";
    for (i = 0; i <= text.length; i++) {
        result += txt[i];
    }
    return result;
}

app.makeRandomText = function (length, characterSet) {
    var i;
    var s = "";
    for (i = 1; i <= length; i++) {
        randomIndex = Math.floor(characterSet.length * Math.random());
        randomChar = characterSet.substr(randomIndex, 1);
        s += randomChar;
    }
    return s;
}


