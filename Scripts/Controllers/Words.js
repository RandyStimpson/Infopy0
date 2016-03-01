/**************************************************************************************************************

    This moudule computes entropy based on words. Since we don't want to do a dictionary lookup to see if
    something is a word we will simulate words by defining a word as follows.

        characters -- alphabetic characters or delimiters
        astring -- a sequence of alphabetic characters
        word - an astring that begins with a vowel and alternates between constanants and vowels. For this 
            computation we will consider Y a constanant.
        nonword - an astring that is not a word
        dstring -- a sequence of delimiters

    Example words: is ezepeze oZoNe

    Example nonwords: iss banana

    belongTo[] describes what kind of object a character belongs to. The object types are dstring, word and
        nonword. If the character is in a dstring of length 1 belongsTo[] value will be "d1". If the character
        belongs to a word of length 2 it will have value "w2". If the character belongs to a nonword of length
        3 its value will be "n3". These values are used to calculate the proability of the object type which
        is in turn used to calculate entropy.


**************************************************************************************************************/

app.controller("wordsCtrl", function ($scope) {

    var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var delimiters = " .!?";
    var punctuation = ".!?";
    var characterSet = alphabet + delimiters;
    var vowels = "aeiouAEIOU";
    var constanants = "bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ"
    var text = "";
    var belongsTo = [];
    var normalizingFactor;
    $scope.formattedText = "hello";

    var init = function () {
        text = makeWord();
        do {
            //Append random word
            text += " " + makeWord();
        } while (text.length < 1000);

        $scope.formattedText = formatText(text);
        $scope.entropy = calculateEntropy();
    }

    $scope.makeOrganizedText = function () {
        init();
    }

    $scope.makeRandomText = function () {
        text = app.makeRandomText(1000, characterSet);
        $scope.formattedText = formatText(text);
        $scope.entropy = calculateEntropy();
    }

    $scope.scrambleText = function () {
        text = app.scrambleText(text);
        $scope.formattedText = formatText(text);
        $scope.entropy = calculateEntropy();
    }

    $scope.makeChange = function () {
        var r = Math.floor(text.length * Math.random());
        var randomChar = app.makeRandomText(1, characterSet);
        text = text.substr(0, r) + randomChar + text.substr(r + 1);
        $scope.formattedText = formatText(text, r);
        $scope.entropy = calculateEntropy();
        //        $scope.entropy = computeEntropyBasedOnDesignPattern();
        //        $scope.normalizedEntropy = Math.round($scope.entropy * normalizingFactor);
        //        if ($scope.normalizedEntropy > $scope.maximumEntropy) {
        //            $scope.maximumEntropy = $scope.normalizedEntropy;
        //            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
        //        }
        //        if ($scope.normalizedEntropy < $scope.minimunEntropySinceMax)
        //            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
    }

    var makingChanges = false;
    $scope.makeContinuousChanges = function () {
        if (makingChanges === true) {
            makingChanges = false;
            $('#mcc').text('Make Continuous Changes');
            return;
        }
        makingChanges = true;
        $('#mcc').text('STOP making changes');
        makeChangeRecursive();
    }

    var makeChangeRecursive = function () {
        if (makingChanges === false)
            return;
        $scope.makeChange();
        $scope.$apply(); //updates the UI
        setTimeout(makeChangeRecursive, 100);
    }



    var formatText = function (text, changeIndex) {
        var string, delimiters, formattedString;
        if (changeIndex === undefined) changeIndex = -1;
        var i = 0, j, b = 0, formattedText = "";

        do {

            delimiters = getDelimiters(text, i);
            i += delimiters.length;
            for (j = 0; j < delimiters.length; j++)
                belongsTo[b++] = "d" + delimiters.length;

            //Format changed text if in this string
            formattedString = delimiters;
            if ((changeIndex < i) && (changeIndex >= i - delimiters.length)) {
                n = changeIndex - (i - delimiters.length);
                formattedString = delimiters.substr(0, n) + '<span class="change-text">' + delimiters.charAt(n) + '</span>' + string.substr(n + 1);
            }
            formattedString = '<span class="delimiter">' + formattedString + '</span>';

            formattedText += formattedString;

            string = getString(text, i)
            i += string.length;

            //Format changed text if in this string
            formattedString = string;
            if ((changeIndex < i) && (changeIndex >= i - string.length)) {
                n = changeIndex - (i - string.length);
                formattedString = string.substr(0, n) + '<span class="change-text">' + string.charAt(n) + '</span>' + string.substr(n + 1);
            }

            //Format the rest of the string
            if (isWord(string)) {
                formattedText += '<span class="word">' + formattedString + '</span>';
                for (j = 0; j < string.length; j++)
                    belongsTo[b++] = "w" + string.length;
            }
            else {
                formattedText += formattedString;
                for (j = 0; j < string.length; j++)
                    belongsTo[b++] = "n" + string.length;
            }

        } while (i < text.length);

        return formattedText;
    }

    var getDelimiters = function (text, start) {
        var result = "";
        var i = start;
        while ((delimiters.indexOf(text.charAt(i)) >= 0) && (i < text.length)) {
            result += text.charAt(i++);
        }
        return result;
    }

    var getString = function (text, start) {
        var result = "";
        if (start >= text.length) return "";
        var i = start;
        while (delimiters.indexOf(text.charAt(i)) === -1) {
            result += text.charAt(i++);
        }
        return result;
    }

    var isWord = function (text) {
        var i = 0;
        while (i < text.length) {
            if (i % 2 === 0) {
                if (vowels.indexOf(text.charAt(i)) === -1)
                    return false;
            }
            else {
                if (vowels.indexOf(text.charAt(i)) >= 0)
                    return false;
            }
            i++;
        }
        return true;
    }

    var makeWord = function () {
        var i, word = "";
        length = randomWordSize();
        for (i = 1; i <= length; i++) {
            if ((i % 2) === 1)
            //Append random vowel
                word += vowels.charAt(Math.floor(Math.random() * 10));
            else
            //Append random constanant
                word += constanants.charAt(Math.floor(Math.random() * 42));
        }
        return word;
    }

    var randomWordSize = function () {
        // Returns a value between 1 and 11 inclusive where 6 is the most likely word size
        return 1 + Math.floor(6 * Math.random()) + Math.floor(6 * Math.random());
    }


    var pOfWordLookupTable = [0, 5 / 26, (5 * 21) / (26 * 26)];
    var pOfWord = function (length) {
        if (pOfWordLookupTable[length] === undefined) {
            if (length % 2 === 0)
                pOfWordLookupTable[length] = pOfWord(length - 1) * 21 / 26;
            else
                pOfWordLookupTable[length] = pOfWord(length - 1) * 5 / 26;
        }
        return pOfWordLookupTable[length];
    }

    var pOfNonword = function (length) {
        return 1 - pOfWord(length);
    }

    var pOfAstringLookupTable = [0, 4 / 56, (52 / 56) * (4 / 56)]
    var pOfAstring = function (length) {
        if (pOfAstringLookupTable[length] === undefined) {
            pOfAstringLookupTable[length] = pOfAstring(length - 1) * 52 / 56;
        }
        return pOfAstringLookupTable[length];
    }

    var pOfDstringLookupTable = [0, 52 / 56, (4 / 56) * (52 / 56)];
    var pOfDstring = function (length) {
        if (pOfDstringLookupTable[length] === undefined) {
            pOfDstringLookupTable[length] = pOfDstring(length - 1) * 52 / 56;
        }
        return pOfDstringLookupTable[length];
    }

    var pThatSequenceIsAstring = 0.5;
    var pThatSequenceIsDstring = 0.5;

    var delimiterCount;
    var calculateEntropy = function () {
        var sum = 0, i, result;
        for (i = 0; i < text.length; i++) {
            sum += entropyTerm(i);
        }
        return -sum;
    }

    var entropyTerm = function (i) {
        var p, result, length;

        length = parseInt(belongsTo[i].substr(1));
        if (belongsTo[i].charAt(0) === "d")
            p = pThatSequenceIsDstring * pOfDstring(length);
        if (belongsTo[i].charAt(0) === "w")
            p = pThatSequenceIsAstring * pOfWord(length);
        if (belongsTo[i].charAt(0) === "n")
            p = pThatSequenceIsAstring * pOfNonword(length);

        result = p * Math.log(p);
        return result;
    }

    init();
});
