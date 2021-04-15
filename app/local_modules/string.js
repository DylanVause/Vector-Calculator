
///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//
// Contains various functions that act on strings

module.exports.replaceSubstring = replaceSubstring;
module.exports.removeWhitespaces = removeWhitespaces;
module.exports.stringOccurrence = stringOccurrence;


function replaceSubstring(sourceString, replaceStartIndex, replaceEndIndex, subString) {
    let srcAsArray = sourceString.toString().split('');
    srcAsArray.splice(replaceStartIndex, replaceEndIndex - replaceStartIndex + 1, subString);
    return srcAsArray.join('');
}

function removeWhitespaces(sourceString) {
    let srcAsArray = sourceString.split('');
    for (let ii = 0; ii < srcAsArray.length; ++ii) {
        if (srcAsArray[ii] == ' ') {
            srcAsArray.splice(ii, 1);
            --ii;
        }
    }
    return srcAsArray.join('');
}

// Returns how many times a substring is found in the source string
function stringOccurrence(sourceString, substring) {
   
    let pos = 0;
    let occurrences = 0;

    while (true) {
        let foundPos = sourceString.indexOf(sourceString, pos);
        if (foundPos == -1) break;
      
        ++occurrences;
        pos = foundPos + 1; // continue the search from the next position
    }

    return occurrences;
}