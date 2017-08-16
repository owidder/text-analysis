'use strict';

/* global bottle */
/* global _ */
/* global d3 */

bottle.factory("words", function (container) {

    var proxy = container.proxy;
    var SimplePromise = container.SimplePromise;

    function getWordListFromRelPathListRecursive(relPathList, index, wordList, finishedPromise) {
        var relPath = relPathList[index];

        proxy.getWordList(relPath).then(function (_wordList) {
            _.forOwn(_wordList, function (value, word) {
                wordList.push({
                    word: word,
                    value: value
                });
            });

            if(index < relPathList.length - 1) {
                getWordListFromRelPathListRecursive(relPathList, index+1, wordList, finishedPromise);
            }
            else {
                finishedPromise.resolve(wordList);
            }
        });
    }
    
    function aggregateWordListByWeight(wordList) {
        var agg = d3.nest()
            .key(function (d) {
                return d.word;
            })
            .rollup(function (d) {
                return d3.sum(d, function (g) {
                    return g.value;
                })
            })
            .entries(wordList);

        return agg;
    }

    function aggregateWordListByOccurrence(wordList) {
        var agg = d3.nest()
            .key(function (d) {
                return d.word;
            })
            .rollup(function (d) {
                return d3.sum(d, function () {
                    return 1;
                })
            })
            .entries(wordList);

        return agg;
    }
    
    function enrichAgglist(aggList, relPathList) {
        aggList.forEach(function (element) {
            element.total = relPathList.length;
            if(element.occurrence == relPathList.length) {
                element.all = true;
            }
        });

        return aggList;
    }
    
    function getTopWordsFromRelPathList(relPathList) {
        var recursionFinished = new SimplePromise();
        var p = new SimplePromise();
        getWordListFromRelPathListRecursive(relPathList, 0, [], recursionFinished);
        recursionFinished.promise.then(function (wordList) {
            var aggListByOccurrence = aggregateWordListByOccurrence(wordList);
            var aggListByWeight = aggregateWordListByWeight(wordList);
            p.resolve({
                byOccurrence: aggListByOccurrence,
                byWeight: aggListByWeight
            });
        });

        return p.promise;
    }

    function mergeAggLists(byWeight, byOccurrence) {
        return byWeight.map(function (byWeightElement) {
            var byOccurenceElement = _.find(byOccurrence, {"key": byWeightElement.key});
            return ({
                key: byWeightElement.key,
                weight: byWeightElement.value,
                occurrence: byOccurenceElement.value
            })
        })
    }

    function showTopWordsFromRelPathList(relPathList, templateId, elementId) {
        getTopWordsFromRelPathList(relPathList).then(function (aggListObj) {
            var mergedAggList = mergeAggLists(aggListObj.byWeight, aggListObj.byOccurrence);
            var sortedAggList = _.orderBy(mergedAggList, ["weight", "occurrence"], ['desc', 'desc']);
            var enrichedAggList = enrichAgglist(sortedAggList.slice(0, 100), relPathList);
            var element = $("#" + elementId);
            element.empty();
            var templateScript = $("#" + templateId).html();
            var template = Handlebars.compile(templateScript);
            var html = template({total: relPathList.length, words: enrichedAggList});
            element.append(html);
        });
    }
    
    function clearTopWords(elementId) {
        var element = $("#" + elementId);
        element.empty();
    }

    return {
        getTopWordsFromRelPathList: getTopWordsFromRelPathList,
        showTopWordsFromRelPathList: showTopWordsFromRelPathList,
        clearTopWords: clearTopWords
    }
});