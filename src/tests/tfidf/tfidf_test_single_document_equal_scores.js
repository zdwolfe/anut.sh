var tfidf = require('../tfidf');
var redis = require('redis').createClient();

function runTest() {
    var totalTermCount = 0;
    for (var prop in documents[documents.length - 1]) {
        if (documents[documents.length - 1].hasOwnProperty(prop)) {
            totalTermCount+=documents[documents.length-1][prop];
        }
    }
    tfidf.getScores(documents[documents.length-1], totalTermCount, function(scores) {
        var fail = false;
        if (scores.one !== scores.two || scores.one !== scores.three || scores.one !== scores.four) {
            fail = true;
        }
        var success = (fail === false);
        console.log('Test has pased: ' + success);
        process.exit(success);
    });
}

var documents = [];
documents.push({
    'one': 1,
    'two': 1,
    'three': 1,
    'four': 1
});

var keysServiced = 0;
for (var key in documents[documents.length - 1]) {
    if (documents[documents.length - 1].hasOwnProperty(key)) {
        (function(key) {
            redis.set(key, 0, function(err, res) {
                keysServiced++;
                if (keysServiced === Object.keys(documents[documents.length - 1]).length) {
                    return runTest();
                }
            });
        })(key);
    }
}

