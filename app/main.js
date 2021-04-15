///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//

try {

// Load the vector math module for vector calculations
const math = require('./local_modules/vector-math.js');

const stringjs = require('./local_modules/string.js')

// Load in config
const FileManager = require('./local_modules/file-management.js')
const { ipcRenderer } = require('electron')
let showAdvancedErrors = false;
// Must be between 0 and 8
let outputFixedNumber = 4;
let angleMode = 'deg';
FileManager.readConfig((config) => {
    outputFixedNumber = config.decimalPoints;
    angleMode = config.angleMode;
    showAdvancedErrors = config.showAdvancedErrors;
    document.querySelector('.deg-rad-grad').innerText = angleMode.toUpperCase();
    ipcRenderer.sendSync('set-keep-on-top', config.keepOnTop);
})

//////////////////////////////////
// SETUP MATHJS

let mathjs = require('mathjs');
// This lets us use the input to assign variables.  For example, x = 5
let scope = {};
// const { config, e, acos, sec } = require('mathjs');

const create = mathjs.create;
const all = mathjs.all;

mathjs = create(all);

// Configure mathjs to use angleMode with trig functions
const originalTrigFunctions = {
    sin: mathjs.sin,
    cos: mathjs.cos,
    tan: mathjs.tan,
    asin: mathjs.asin,
    acos: mathjs.acos,
    atan: mathjs.atan
}

mathjs.import({
    sin: function (angle) {
        if (typeof(angle) == 'number')
        {
            return originalTrigFunctions.sin(mathjs.unit(angle, angleMode));
        }
        return originalTrigFunctions.sin(angle.to(angleMode));
    },
    cos: function (angle) {
        if (typeof(angle) == 'number')
        {
            return originalTrigFunctions.cos(mathjs.unit(angle, angleMode));
        }
        return originalTrigFunctions.cos(angle.to(angleMode));
    },
    tan: function (angle) {
        if (typeof(angle) == 'number')
        {
            return originalTrigFunctions.tan(mathjs.unit(angle, angleMode));
        }
        return originalTrigFunctions.tan(angle.to(angleMode));
    },
    csc: function (angle) {
        return 1 / mathjs.sin(angle);
    },
    sec: function (angle) {
        return 1 / mathjs.cos(angle);
    },
    cot: function (angle) {
        return 1 / mathjs.tan(angle);
    },
    asin: function (number) {
        return mathjs.unit(originalTrigFunctions.asin(number), 'rad').to(angleMode);
    },
    acos: function (number) {
        return mathjs.unit(originalTrigFunctions.acos(number), 'rad').to(angleMode);
    },
    atan: function (number) {
        return mathjs.unit(originalTrigFunctions.atan(number), 'rad').to(angleMode);
    },
    acsc: function (number) {
        return mathjs.asin(1 / number);
    },
    asec: function (number) {
        return mathjs.acos(1 / number);
    },
    acot: function (number) {
        return mathjs.atan(1 / number);
    }

}, {override: true})


// Sets up the input field for the first time
resetInputField();

const calculator = {
    lastSolidResult: [],    // When AC is pressed, lastResult = lastSolidResult
    lastResult: [],         // Vector result of the last calculation
    firstOperand: [],       // The first vector in the next calculation

    // The operator currently being used for calculations.  Also signals a pending calculation
    get activeOperator() {
        return this._activeOperator
    },
    set activeOperator(value) {
        this._activeOperator = value;
        if (value != null && value != undefined) {
            displayActiveOperator(getOperatorSymbol(value));
        } else {
            displayActiveOperator('');
        }

    },
    _activeOperator: null,
}

// Handle clicks on the deg-rad-grad button
const degRadGradButton = document.querySelector('.deg-rad-grad');
degRadGradButton.addEventListener('click', (event) => {
    try {
    switch (angleMode) {
        case 'deg':
            angleMode = 'rad';
            break;
        case 'rad':
            angleMode = 'grad';
            break;
        case 'grad':
            angleMode = 'deg';
            break;
    }
    degRadGradButton.innerText = angleMode.toUpperCase();
    FileManager.readConfig( (config) => {
        config.angleMode = angleMode;
        FileManager.writeConfig(config);
    })
    } catch (err) {
        alert(err)
    }
})

// Handle clicking the menu button
const menuButton = document.getElementById('menu-button')
const menu = document.getElementById('menu')
menuButton.addEventListener('click', (event) => {
    FileManager.readConfig((config) => {
        window.postMessage({
            message: 'initialize-menu-fields',
            config: config
        })
        menu.hidden = false;
    });
})

// Handle messages from the menu
window.addEventListener('message', function(event) {
    switch (event.data.message) {
        case ('close-menu'):
            menu.hidden = true;
            break;
        case ('update-config'):
            FileManager.readConfig( (config) => {
                config.decimalPoints = event.data.config.decimalPoints;
                config.keepOnTop = event.data.config.keepOnTop;
                config.showAdvancedErrors = event.data.config.showAdvancedErrors;
                FileManager.writeConfig(config);
            })
            outputFixedNumber = event.data.config.decimalPoints;
            showAdvancedErrors = event.data.config.showAdvancedErrors;
            ipcRenderer.sendSync('set-keep-on-top', event.data.config.keepOnTop);
            break;
        case ('read-eula'):
            FileManager.readEULA((text) => {
                window.postMessage({
                    message: 'show-eula',
                    eulaText: text
                })
            })
    }
})

// Handle clicks to the keypad
const keysContainer = document.querySelector('.buttons-container');
keysContainer.addEventListener('click', (event) => {

    try {

        const target = event.target.closest('button');

        // There's this glitch where sometimes the cursor clicks on the button border, 
        // and when that happens 'target' becomes null.  It's a rare event.  I think it
        // ony happens when you rapidly click the mouse over the keys like a madman.
        if (target == null) {
            return;
        }

        // No previous results (either the previous input was an error, or the program just started with no history)
        if (calculator.lastResult.length == 0 && calculator.firstOperand.length == 0) {

            if (isInputFieldEmpty()) {
                // Do nothing
            }

            // The input field has content
            else {
                if (target.value == 'all-clear') {
                    allClear();
                    return;
                } else if (getInputAsVector() == '') {
                    return;
                }
                switch (target.value) {
                    case ('multiply-scalar'):
                        calculator.firstOperand = getInputAsVector();
                        calculator.activeOperator = target.value;
                        displayVector(calculator.firstOperand);
                        resetInputField(true);
                        break;

                    case ('add'):
                    case ('subtract'):
                    case ('dot-product'):
                        calculator.firstOperand = getInputAsVector();
                        calculator.activeOperator = target.value;
                        displayVector(calculator.firstOperand);
                        resetInputField();
                        break;

                    case ('cross-product'):
                        // Check if the vector is 3D, which is neccesary for cross product
                        if (getInputAsVector().length != 3) {
                            showPopup('Error', 'Cross product is only valid for 3D vectors')
                        }

                        // It is 3D, so everything is good
                        else {
                            calculator.firstOperand = getInputAsVector();
                            calculator.activeOperator = target.value;
                            displayVector(calculator.firstOperand);
                            resetInputField();
                        }
                        break;

                    case ('magnitude'):
                        displayVector(getInputAsVector(), '|v|');
                        calculator.lastResult = [math.vectorMagnitude(getInputAsVector())];
                        calculator.firstOperand = [];
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;

                        calculator.activeOperator = null;

                        resetInputField();
                        break;

                    case ('equal-sign'):
                        calculator.lastResult = getInputAsVector();
                        calculator.firstOperand = [];
                        displayVector(calculator.lastResult, '');
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;
                        resetInputField();
                        break;
                }
            }

        }

        else {
            //  The operator just calculated this step.  Also a sign if there even was a calculation
            let justCalculatedOperator = null;

            // Calculate previous calculation if calculation pending
            if (calculator.activeOperator != null && !isInputFieldEmpty()) {
                if (target.value == 'all-clear') {
                    allClear();
                    return;
                } else if (getInputAsVector() == '') {
                    return;
                } else if(calculator.activeOperator == 'cross-product' && getInputAsVector().length != 3) {
                    showPopup('Error', 'Cross product is only valid for 3D vectors');
                    return;
                }
                // Display the input vector
                displayVector(getInputAsVector(), getOperatorSymbol(calculator.activeOperator));
                // do the calculations 
                calculator.lastResult = calculate(calculator.firstOperand, getInputAsVector(), calculator.activeOperator);
                justCalculatedOperator = calculator.activeOperator;
                // Display the result, unless we are stacking operations (like with + or - operations)
                if (!((calculator.activeOperator == 'add' || calculator.activeOperator == 'subtract') && (target.value == 'add' || target.value == 'subtract'))) {
                    displayVector(calculator.lastResult, '=', true);
                    calculator.lastSolidResult = calculator.lastResult;
                }
                // We are finished, so set the current operator to null
                calculator.activeOperator = null;


                resetInputField();
            }



            // We must be changing our minds about the operator we want
            if (isInputFieldEmpty() && calculator.activeOperator != null && calculator.firstOperand.length > 0) {

                // This makes sure that the input field doesn't stay at 'scalar-only' if we pick an operator other than Scalar Multiple
                if (calculator.activeOperator == 'multiply-scalar' && target.value != 'multiply-scalar') {
                    resetInputField();
                }

                switch (target.value) {
                    case ('all-clear'):
                        allClear();
                        break;
                    case ('add'):
                    case ('subtract'):
                        calculator.activeOperator = target.value;
                        break;

                    case ('multiply-scalar'):
                        resetInputField(true);
                        calculator.activeOperator = target.value;
                        break;

                    case ('dot-product'):
                        calculator.activeOperator = target.value;
                        break;

                    case ('cross-product'):
                        // Check if the vector is 3D, which is neccesary for cross product
                        if (calculator.firstOperand.length != 3) {
                            showPopup('Error', 'Cross product is only valid for 3D vectors')
                        }

                        // It's not 3D, so everything is good
                        else {
                            calculator.activeOperator = target.value;
                        }
                        break;

                    case ('magnitude'):
                        displayVector(calculator.firstOperand, '|v|');
                        calculator.lastResult = [math.vectorMagnitude(calculator.firstOperand)];
                        calculator.activeOperator = null;
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;
                        break;
                }
            }

            // We must be starting a new operation, based off the last result
            else if (isInputFieldEmpty()) {
                switch (target.value) {
                    case ('all-clear'):
                        allClear();
                        break;
                    case ('add'):
                    case ('subtract'):
                        if (justCalculatedOperator != 'add' && justCalculatedOperator != 'subtract') {
                            displayVector(calculator.lastResult)
                        }
                        calculator.firstOperand = calculator.lastResult;
                        calculator.activeOperator = target.value;
                        break;

                    case ('multiply-scalar'):
                        resetInputField(true);
                        calculator.firstOperand = calculator.lastResult;
                        if (calculator.activeOperator == null) {
                            displayVector(calculator.firstOperand)
                        }
                        calculator.activeOperator = target.value;
                        break;

                    case ('dot-product'):
                        calculator.firstOperand = calculator.lastResult;
                        if (calculator.activeOperator == null) {
                            displayVector(calculator.firstOperand)
                        }
                        calculator.activeOperator = target.value;
                        break;

                    case ('cross-product'):
                        // Check if the vector is 3D, which is neccesary for cross product
                        if (calculator.lastResult.length != 3) {
                            showPopup('Error', 'Cross product is only valid for 3D vectors')
                        }

                        // It's not 3D, so everything is good
                        else {
                            calculator.firstOperand = calculator.lastResult;
                            displayVector(calculator.firstOperand)
                            calculator.activeOperator = target.value;
                        }
                        break;

                    case ('magnitude'):
                        displayVector(calculator.lastResult, '|v|');
                        calculator.lastResult = [math.vectorMagnitude(calculator.lastResult)];
                        calculator.activeOperator = null;
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;
                        break;
                }
            }

            // We must be starting a new operation from scratch
            else {
                if (target.value == 'all-clear') {
                    allClear();
                    return;
                } else if (getInputAsVector() == '') {
                    return;
                }
                switch (target.value) {
                    case ('multiply-scalar'):
                        calculator.firstOperand = getInputAsVector();
                        calculator.activeOperator = target.value;
                        displayVector(calculator.firstOperand);
                        resetInputField(true);
                        break;

                    case ('add'):
                    case ('subtract'):
                    case ('dot-product'):
                        calculator.firstOperand = getInputAsVector();
                        calculator.activeOperator = target.value;
                        displayVector(calculator.firstOperand);
                        resetInputField();
                        break;
                    case ('cross-product'):
                        // Check if the vector is 3D, which is neccesary for cross product
                        if (getInputAsVector().length != 3) {
                            showPopup('Error', 'Cross product is only valid for 3D vectors')
                        }

                        // It is 3D, so everything is good
                        else {
                            calculator.firstOperand = getInputAsVector();
                            calculator.activeOperator = target.value;
                            displayVector(calculator.firstOperand);
                            resetInputField();
                        }
                        break;

                    case ('magnitude'):
                        displayVector(getInputAsVector(), '|v|');
                        calculator.lastResult = [math.vectorMagnitude(getInputAsVector())];
                        calculator.firstOperand = [];
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;

                        calculator.activeOperator = null;

                        resetInputField();
                        break;

                    case ('equal-sign'):
                        calculator.lastResult = getInputAsVector();
                        calculator.firstOperand = [];
                        displayVector(calculator.lastResult, '');
                        displayVector(calculator.lastResult, '=', true);
                        calculator.lastSolidResult = calculator.lastResult;
                        resetInputField();
                        break;
                }

            }
        }

    } catch (err) {
        showPopup('Program bug detected: ', err)
    }

});

// Returns the calculated vector
function calculate(vector1, vector2, operator) {
    switch (operator) {
        case ('add'):
            return math.vectorSum(vector1, vector2);
        case ('subtract'):
            return math.vectorSubtract(vector1, vector2);
        case ('dot-product'):
            return [math.vectorDotProduct(vector1, vector2)];
        case ('cross-product'):
            if (vector1.length != 3 || vector2.length != 3) {
                showPopup('Error', 'Cross product is only valid for 3D vectors')
            }
            return math.vectorCrossProduct(vector1, vector2);
        case ('multiply-scalar'):
            return math.vectorScalarMultiple(vector1, vector2[0]);
    }
}

function allClear() {
    calculator.activeOperator = null;
    calculator.firstOperand = [];
    calculator.lastResult = calculator.lastSolidResult;
    removeTrailingOutputs();
    resetInputField();
}



//////////////////////////////////////////////////////////////////////////////////////////
// INPUT FIELD BEHAVIOUR
// This code handles various behaviours related to the input field.
// Here you will find functions such as resetInputField, createNewInputField, etc.

// Get a reference to the greyInputField element
const greyInputField = document.getElementById('grey-input-field');

// Create a new input field whenever there is text input to greyInputField
greyInputField.addEventListener('input', function () {
    createNewInputField(greyInputField.value == ',' ? '' : greyInputField.value).focus();
    document.getElementById('input-field-container').scrollTo(document.getElementById('input-field-container').scrollWidth, 0);
    greyInputField.value = '';
})

// Creates a new vector input field
function createNewInputField(text) {
    let newField = document.createElement('input');
    newField.className = 'input-field';
    newField.placeholder = '0';

    // If creation text is passed through, assign it to the field
    if (text) {
        newField.value = text;
    }

    // Listen for delete or backspace to delete the field
    newField.addEventListener('keydown', function (event) {
        if ((event.key == 'Delete' || event.key == 'Backspace') && this.value == '' && !greyInputField.hidden) {
            event.preventDefault();
            if (this.previousSibling.focus) {
                this.previousSibling.focus()
            } else if (this.nextSibling.focus) {
                this.nextSibling.focus()
            }
            this.remove();
        }
        if (event.key == ',') {
            event.preventDefault();
            createNewInputField('').focus();
        }
    })

    let container = document.getElementById('input-field-container');
    container.insertBefore(newField, container.children[container.children.length - 1]);
    return newField;
}

function resetInputField(bUseScalarOnly, emptyFieldLength = 1) {
    let fields = document.querySelectorAll('.input-field');

    for (let ii = 0; ii < fields.length; ++ii) {
        fields[ii].remove();
    }

    if (bUseScalarOnly == true) {
        document.getElementById('grey-input-field').hidden = true;
    } else {
        document.getElementById('grey-input-field').hidden = false;
    }

    for (let ii = 0; ii < emptyFieldLength; ++ii) {
        createNewInputField('').focus();
    }
}

function isInputFieldEmpty() {
    let fields = document.querySelectorAll('.input-field');

    for (let ii = 0; ii < fields.length; ++ii) {
        if (fields[ii].value != '') {
            return false;
        }
    }
    return true;
}

function getInputAsVector() {
    let fields = document.querySelectorAll('.input-field');

    let inputVector = [];

    try {

        for (let ii = 0; ii < fields.length; ++ii) {
            inputVector[ii] = parseFloat(mathjs.evaluate(fields[ii].value, scope));

            if (Number.isNaN(inputVector[ii])) {
                showPopup('Error', 'Field ' + [ii + 1] + ' is not a number');
                return '';
            }
            else if (!Number.isFinite(inputVector[ii])) {
                showPopup('Error', 'Divide by zero error');
                return '';
            }
        }

        return inputVector;

    } catch (err) {
        if (!showAdvancedErrors) {
            if (err.toString().startsWith('Error: ')) {
                err = stringjs.replaceSubstring(err, 0, 6, "");
            } else if (err.toString().startsWith('Error: ')) {
                err = 'Syntax Error'
            } else if (err.toString().startsWith('SyntaxError:')) {

            } else {
                err = 'Syntax Error'
            }
    }
        showPopup('Error', err)
        return '';
    }
}

function setInputToVector(vector) {
    if (calculator.activeOperator == 'multiply-scalar' && vector.length != 1)
    {
        return;
    }
    resetInputField(calculator.activeOperator == 'multiply-scalar', 0);
    for (let ii = 0; ii < vector.length; ++ii) {
        createNewInputField(vector[ii].toString())
    }
}

function displayActiveOperator(operator) {
    document.getElementById('current-operator').innerHTML = operator;
}

// Display a vector to the output field
function displayVector(vector, prefix, bUseStrong) {

    let outputWindow = document.querySelector('.output-window')

    /*
    if (vector == '' || vector == null || vector.length == 0 || vector[0] == '') {
        alert('line 469')
        return;
    } */

    // If we dont use a prefix we should just set it to an empty string
    if (prefix == undefined) {
        prefix = '';
    }

    let resultString = [prefix + ' ', '('];

    for (let ii = 0; ii < vector.length; ++ii) {
        resultString.push(parseFloat(vector[ii].toFixed(outputFixedNumber)));

        if (ii != vector.length - 1) {
            resultString.push(', ');
        }
    }

    resultString.push(')');

    let outputButton = document.createElement('button');
    outputButton.className = 'output-button';

    if (bUseStrong == true) {
        resultString.unshift('<strong>');
        resultString.push('</strong>');
    } else {
        outputButton.style.color = 'rgb(200,200,200)';
    }

    let outputP = document.createElement('p')
    outputP.className = "output-text";
    outputP.innerHTML = resultString.join('')
    outputButton.append(outputP);
    outputWindow.append(outputButton);
    outputWindow.scrollTo(0, outputWindow.scrollHeight);

    outputButton.vector = vector;
    outputButton.addEventListener('click', () => {
        setInputToVector(outputButton.vector);
    })
}

function removeTrailingOutputs() {
    let outputWindow = document.querySelector('.output-window');
    if (outputWindow.children.length > 0) {
        while (
            outputWindow.children[outputWindow.children.length - 1] != undefined &&
            outputWindow.children[outputWindow.children.length - 1].textContent.includes('=') == false) {
            outputWindow.children[outputWindow.children.length - 1].remove();
        }
    }
}


// END OF INPUT BEHAVIOUR
///////////////////////////////////////////////////////////////////////////////////////////////////


function getOperatorSymbol(operator) {
    switch (operator) {
        case ('add'):
            return '+';
        case ('subtract'):
            return '-';
        case ('cross-product'):
            return '×';
        case ('magnitude'):
            return '|V|';
        case ('dot-product'):
            return '⋅';
        case ('multiply-scalar'):
            return 'a<strong>v</strong>';
        default:
            return operator;
    }
}



document.querySelector('.popup-close').addEventListener('click', function () {

    let popup = document.getElementById('popup');
    popup.hidden = true
})


function showPopup(headerText, msg) {
    document.getElementById('popup-header').innerText = headerText;
    document.getElementById('popup-msg').innerText = msg;
    let popup = document.getElementById('popup');
    popup.hidden = false;
}

}catch(err){
    alert(err)
}