/*
    This module demonstrates a calculation of entropy as it relates a design pattern. Actual information consists of many design patterns
    but for the sake of calculation we will just pick one for the entropy calculation. These are the properties of the pattern:

        1) It must begin with a capital letter.
        2) It must end with a punctuation mark.
        3) All characters in between must be lower case letters.

    EXAMPLES of strings that match the design pattern:

        Xqzg.
        Doesentropyapplytoinformation?
        Theprobabilityofarandomstringthislongmatchingthedesignpatternisextremelylow!

    For the sake of discussion we will call a string that matches the design patters a Match. A string that does not match the design pattern and
    that does not contain a matching design pattern is a Miss. A string that matches the design pattern except for the punctuation mark is a 
    Subpattern.

    The belongsTo array contains as many values as there are characters of text. The values indicate whether or not the character belongs to a miss
    or a match as well is the size of the miss or match. Positive numbers are for matches and negative numbers are for misses. These numbers are used
    to calculate entropy.

*/
app.controller("designPatternCtrl", function ($scope) {

    var characterSet1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!?";
    var characterSet2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var belongsTo = [];
    var normalizingFactor;

    init = function () {

        var text = "";
        var i = 0;

        for (i = 1; i <= 50; i++) {
            text += makeRandomSizedMatch();
        }

        $scope.info = text;
        $scope.formattedText = formatText($scope.info);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        normalizingFactor = 1 / $scope.entropy;
        $scope.normalizedEntropy = 1;
        $scope.maximumEntropy = 1;
        $scope.minimunEntropySinceMax = 1;
    }

    $scope.scrambleText = function () {
        $scope.info = app.scrambleText($scope.info);
        $scope.formattedText = formatText($scope.info, -1);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        $scope.normalizedEntropy = Math.round($scope.entropy * normalizingFactor);
        if ($scope.normalizedEntropy > $scope.maximumEntropy) {
            $scope.maximumEntropy = $scope.normalizedEntropy;
            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
        }
        if ($scope.normalizedEntropy < $scope.minimunEntropySinceMax)
            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
    }

    $scope.makeOrganizedText = function () {
        init();
    }

    $scope.makeChange = function () {
        var r = Math.floor($scope.info.length * Math.random());
        var randomChar = app.makeRandomText(1, characterSet1);
        $scope.info = $scope.info.substr(0, r) + randomChar + $scope.info.substr(r + 1);
        $scope.formattedText = formatText($scope.info, r);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        $scope.normalizedEntropy = Math.round($scope.entropy * normalizingFactor);
        if ($scope.normalizedEntropy > $scope.maximumEntropy) {
            $scope.maximumEntropy = $scope.normalizedEntropy;
            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
        }
        if ($scope.normalizedEntropy < $scope.minimunEntropySinceMax)
            $scope.minimunEntropySinceMax = $scope.normalizedEntropy;
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

    $scope.makeRandomText = function () {
        $scope.info = app.makeRandomText(1000, characterSet1);
        $scope.formattedText = formatText($scope.info);
        $scope.entropy = computeEntropyBasedOnDesignPattern();
        normalizingFactor = 10000 / $scope.entropy;
        $scope.normalizedEntropy = 10000;
        $scope.maximumEntropy = 10000;
        $scope.minimunEntropySinceMax = 10000;
    }

    // The probability that a string of length n is a Match
    var pOfMatchLookupTable = [];
    pOfMatch = function (n) {
        if (n <= 2)
            return 0;
        if (pOfMatchLookupTable[n] === undefined)
            pOfMatchLookupTable[n] = Math.pow(26 / 55, n - 1) * 3 / 55;
        return pOfMatchLookupTable[n];
    }

    /*
    This function computes that probability that a string of length N is a Miss.

    A string of length N is a miss if the first N-1 characters of the string is a Miss
    and it is still a miss when on more character is added.
    */
    var pOfMissLookupTable = [];
    pOfMiss = function (n) {
        if (n <= 2)
            return 1;
        if (pOfMissLookupTable[n] == undefined)
            pOfMissLookupTable[n] = pOfMiss(n - 1) * (1 - pOfStringEndingWithSubpattern(n - 1) * 3 / 55);
        return pOfMissLookupTable[n];
    }

    /***************************************************************************************************
    
    This function computes the probability that a string of length n will end with a Subpattern.
    Examples of strings of length 4 that end with a Subpattern are these:

    ABCd   ends with Subpattern Cd 
    ABcd   ends with Subpattern Bcd
    Abcd   ends with Subpattern Abcd
        
    Thus the probability that a string of length 4 ends with a subpattern is giving by

    (probility that the string end with a SubPattern of length 2) +
    (probility that the string end with a SubPattern of length 3) +
    (probility that the string end with a SubPattern of length 4)

    Note that this is a geometric sum minus the first two terms
    
    ***************************************************************************************************/
    pOfStringEndingWithSubpattern = function (n) {
        return geometricSum(n, 26 / 55) - 1 - 26 / 55;
    }

    geometricSum = function (n, ratio) {
        var numerator = 1 - Math.pow(ratio, n + 1);
        var denominator = 1 - ratio;
        return numerator / denominator;
    }


    // Format text by highlighting the matches and the changed text.
    formatText = function (text, changeIndex) {
        if (changeIndex === undefined) changeIndex = -1;
        var segment, miss, match;
        var i = 0;
        var j;
        var formattedText = "";
        belongsTo = [];
        var bi = 0;

        do {
            segment = getPunctuationDelimitedSegment(text, i);
            var segmentParts = splitSegment(segment);

            //Format the miss portion of the segment
            if (changeIndex >= i && changeIndex < i + segmentParts.miss.length) {
                //The change occurred inside the miss
                formattedText += segmentParts.miss.substr(0, changeIndex - i);
                formattedText += '<span class="change-text">' + segmentParts.miss.charAt(changeIndex - i) + '</span>';
                formattedText += segmentParts.miss.substr(changeIndex - i + 1);
            }
            else {
                formattedText += segmentParts.miss;
            }
            i += segmentParts.miss.length;

            //Format the match portion of the segment
            if (changeIndex >= i && changeIndex < i + segmentParts.match.length) {
                //The change occurred inside the match
                formattedText += '<span class="match">' + segmentParts.match.substr(0, changeIndex - i);
                formattedText += '<span class="change-text">' + segmentParts.match.charAt(changeIndex - i) + '</span>';
                formattedText += segmentParts.match.substr(changeIndex - i + 1) + '</span>';
            }
            else {
                formattedText += '<span class="match">' + segmentParts.match + '</span>';
            }
            i += segmentParts.match.length;

            //Compute the values of belongsTo[] so that they can be used in the entropy calculation
            for (j = 0; j < segmentParts.miss.length; j++)
                belongsTo[bi++] = -segmentParts.miss.length;
            for (j = 0; j < segmentParts.match.length; j++)
                belongsTo[bi++] = segmentParts.match.length;

        } while (i < text.length);

        return formattedText;
    }

    getPunctuationDelimitedSegment = function (text, start) {
        var punctuationSet = ".!?";
        var end = start;

        do {
            var ch = text.substr(end, 1);
            end++;
        } while ((end < text.length) && (punctuationSet.indexOf(ch) == -1))
        return text.substr(start, end - start);
    }

    // Split a segment into a miss part and a match part
    splitSegment = function (segment) {
        var result = {};
        var i;

        // If segment is only 2 characters long the whole thing is a miss
        if (segment.length <= 2) {
            result.miss = segment;
            result.match = "";
        }

        // If the segment doesn't end with a punctuation mark the whole thing is a miss
        else if (".!?".indexOf(segment.slice(-1)) == -1) {
            result.miss = segment;
            result.match = "";
        }

        else {
            //Find the index of the first uppercase character of the string going backwards
            var index = segment.length - 1;
            do {
                index--;
                var ch = segment.charAt(index);
            } while ((index >= 0) && (ch === ch.toLowerCase()));

            if ((index < 0) || (index == segment.length - 2)) {
                result.miss = segment;
                result.match = "";
            }
            else {
                result.miss = segment.substr(0, index);
                result.match = segment.substr(index);
            }
        }
        return result;
    }

    computeEntropyBasedOnDesignPattern = function () {
        var i;
        var p;
        sum = 0;

        //TODO can be optimized to reduce calls to Math.log()
        for (i = 0; i <= $scope.info.length; i++) {
            if (belongsTo[i] < 0) p = pOfMiss(-belongsTo[i]);
            if (belongsTo[i] > 0) p = pOfMatch(belongsTo[i]);
            sum += p * Math.log(p);
        }
        return -sum;
    }

    makeRandomMatch = function (size) {
        return app.makeRandomText(1, "ABCDEFGHIJKLMNOPQRSTUVWXYZ") + app.makeRandomText(size - 2, "abcdefghijklmnopqrstuvwxyz") + app.makeRandomText(1, ".!?");
    }

    makeRandomSizedMatch = function () {
        //Vary size randomly between 10 and 30
        var randomSize = Math.floor(10 + 20 * Math.random());
        return makeRandomMatch(randomSize);
    }

    init();

});

