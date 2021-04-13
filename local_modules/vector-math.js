///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


module.exports.vectorSum = vectorSum;
module.exports.vectorSubtract = vectorSubtract;
module.exports.vectorScalarMultiple = vectorScalarMultiple;
module.exports.vectorCrossProduct = vectorCrossProduct;
module.exports.vectorDotProduct = vectorDotProduct;
module.exports.vectorMagnitude = vectorMagnitude;


function vectorSum(...vectors) {
    let result = [];

    for (let vector of vectors) {
        for (let ii = 0; ii < vector.length; ++ii) {
            if (typeof (result[ii]) != 'number') {
                result[ii] = 0;
            }
            result[ii] += vector[ii];
        }
    }

    return result;
}

function vectorSubtract(vector1, vector2) {

    result = vector1;

    for (let ii = 0; ii < vector2.length; ++ii) {
        if (typeof (result[ii]) != 'number') {
            result[ii] = 0;
        }
        result[ii] -= vector2[ii];
    }

    return result;
}

function vectorScalarMultiple(vector, scalar)
{
    for (let ii = 0; ii < vector.length; ++ii)
    {
        vector[ii] *= scalar;
    }
    return vector;
}

function vectorCrossProduct(vector1, vector2) {
    let result = [];

    // Vector dimensions must be equal!
    if (vector1.length != 3 || vector2.length != 3) {
        return false;
    }

    result[0] = vector1[1] * vector2[2] - vector1[2] * vector2[1];
    result[1] = vector1[2] * vector2[0] - vector1[0] * vector2[2];
    result[2] = vector1[0] * vector2[1] - vector1[1] * vector2[0];

    return result;
}

function vectorDotProduct(vector1, vector2) {
    let shortestVectorLength = Math.min(vector1.length, vector2.length);

    let result = 0;

    for (let ii = 0; ii < shortestVectorLength; ++ii) {
        result += vector1[ii] * vector2[ii];
    }

    return result;
}

function vectorMagnitude(vector) {
    let sumOfSquaredComponents = 0

    for (let ii = 0; ii < vector.length; ++ii) {
        sumOfSquaredComponents += vector[ii] * vector[ii];
    }

    return Math.sqrt(sumOfSquaredComponents);
}




