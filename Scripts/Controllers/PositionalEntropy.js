app.controller("positionalEntropyCtrl", function ($scope) {

    //Choosing a character set with 64 characters will give us a maximum entropy of 6 bits per character
    var CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz -;:?,.!'123";

    var text = "EINSTEIN QUOTES: Great spirits have often encountered violent opposition from weak minds.";
    text += " The important thing is not to stop questioning. Curiosity has its own reason for existing.";
    text += " I want to know God's thoughts; the rest are details.";
    text += " Anyone who has never made a mistake has never tried anything new.";
    text += " Everything should be made as simple as possible, but not simpler.";
    text += " He who joyfully marches to music rank and file, has already earned my contempt. He has been given a large brain by mistake, since for him the spinal cord would surely suffice. This disgrace to civilization should be done away with at once. Heroism at command, how violently I hate all this, how despicable and ignoble war is; I would rather be torn to shreds than be a part of so base an action. It is my conviction that killing under the cloak of war is nothing but an act of murder.";
    text += " God is subtle but he is not malicious.";
    text += " We can't solve problems by using the same kind of thinking we used when we created them.";
    text += " The only thing that interferes with my learning is my education.";
    text += " Science without religion is lame. Religion without science is blind.";

    $scope.initialize = function () {

        $scope.info = text;
        $scope.info1 = $scope.info;
        $scope.info2 = "";
        $scope.changeText = "";
        $scope.changeCount = 0;
        $scope.entropy = $scope.calculateEntropy();
        $scope.startingEntropy = $scope.entropy;
        $scope.increasesDuringTheFirst100Changes = 0;
        $scope.decreasesDuringTheFirst100Changes = 0;
        $scope.unchangedDuringTheFirst100Changes = 0;
        $scope.increasesDuringTheLast100Changes = 0;
        $scope.decreasesDuringTheLast100Changes = 0;
        $scope.unchangedDuringTheLast100Changes = 0;
        $scope.changeType = [];
    }

    $scope.makeChange = function () {
        //choose random position in info to change
        $scope.position = Math.floor(Math.random() * $scope.info.length);
        $scope.characterToReplace = $scope.info.substring($scope.position, $scope.position + 1);

        //pick a random character from the alphabet to replace the character at that position
        do {
            $scope.i = Math.floor(Math.random() * CHARACTER_SET.length);
            $scope.changeText = CHARACTER_SET.substring($scope.i, $scope.i + 1);
        } while ($scope.changeText == $scope.characterToReplace);

        $scope.info1 = $scope.info.substring(0, $scope.position);
        $scope.info2 = $scope.info.substring($scope.position + 1, $scope.info.length)
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;

        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy();
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
        if ($scope.changeInEntropy == 0)
            var same = 1;
        $scope.countIncreasesAndDecreasesInEntropy();
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


    $scope.resetText = function () {
        $scope.initialize();
        $('.information-box').removeClass('break-words');
    }

    $scope.calculateEntropy = function () {
        var i;
        var sum = 0;
        for (i = 0; i < CHARACTER_SET.length; i++)
            sum += $scope.entropyTerm(CHARACTER_SET.substr(i, 1));
        return -sum;
    }

    $scope.entropyTerm = function (ch) {
        var i;
        var count = 0;
        for (i = 0; i < $scope.info.length; i++) {
            if (ch == $scope.info.substr(i, 1))
                count++;
        }
        probability = count / $scope.info.length;
        if (probability == 0) {
            return 0;
        }
        return probability * Math.log(probability) / Math.LN2;
    }

    $scope.countIncreasesAndDecreasesInEntropy = function () {
        $scope.changeCount++;
        if ($scope.changeCount <= 100) {
            if ($scope.changeInEntropy > 0)
                $scope.increasesDuringTheFirst100Changes++;
            else if ($scope.changeInEntropy < 0)
                $scope.decreasesDuringTheFirst100Changes++;
            else
                $scope.unchangedDuringTheFirst100Changes++;
        }

        if ($scope.changeCount > 100) {
            var oldestChangeType = $scope.changeType[($scope.changeCount - 1) % 100];
        }
        if ($scope.changeInEntropy > 0)
            $scope.changeType[($scope.changeCount - 1) % 100] = 1;
        else if ($scope.changeInEntropy < 0)
            $scope.changeType[($scope.changeCount - 1) % 100] = -1;
        else
            $scope.changeType[($scope.changeCount - 1) % 100] = 0;

        if ($scope.changeCount <= 100) {
            $scope.increasesDuringTheLast100Changes = $scope.increasesDuringTheFirst100Changes;
            $scope.decreasesDuringTheLast100Changes = $scope.decreasesDuringTheFirst100Changes;
            $scope.unchangedDuringTheLast100Changes = $scope.unchangedDuringTheFirst100Changes;
        } else {
            var lastChangeType = $scope.changeType[($scope.changeCount - 1) % 100];
            if (oldestChangeType != lastChangeType) {
                if (oldestChangeType == 1 && lastChangeType == 0) {
                    $scope.increasesDuringTheLast100Changes--;
                }
                if (oldestChangeType == 1 && lastChangeType == -1) {
                    $scope.increasesDuringTheLast100Changes--;
                    $scope.decreasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == 0 && lastChangeType == 1) {
                    $scope.increasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == 0 && lastChangeType == -1) {
                    $scope.decreasesDuringTheLast100Changes++;
                }
                if (oldestChangeType == -1 && lastChangeType == 1) {
                    $scope.increasesDuringTheLast100Changes++;
                    $scope.decreasesDuringTheLast100Changes--;
                }
                if (oldestChangeType == -1 && lastChangeType == 0) {
                    $scope.decreasesDuringTheLast100Changes--;
                }
            }
            $scope.unchangedDuringTheLast100Changes = 100 - $scope.increasesDuringTheLast100Changes - $scope.decreasesDuringTheLast100Changes;
        }
    }

    $scope.scrambleText = function () {
        $scope.info1 = app.scrambleText($scope.info);
        $scope.info2 = "";
        $scope.changeText = "";
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;
        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy();
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
    }

    $scope.orderText = function () {
        $scope.info1 = app.orderText($scope.info);
        $scope.changeText = "";
        $scope.info2 = "";
        $scope.info = $scope.info1 + $scope.changeText + $scope.info2;
        $scope.oldEntropy = $scope.entropy;
        $scope.entropy = $scope.calculateEntropy();
        $scope.changeInEntropy = $scope.entropy - $scope.oldEntropy;
        $('.information-box').addClass('break-words');
    }

    $scope.initialize();
});