
// Load the vector math module for vector calculations
const math = require('./local_modules/vector-math.js');

// Holds the calculator properties
const calculator = {
    history: [],        // The calculator's output history
    firstOperand: [], // This is the previous operand
    operator: null,     // This is the operator symbol
}

//////////////////////////////////////////////////////////////////////////////////////////
// INPUT FIELD BEHAVIOUR

// Get a reference to the greyInputField element
const greyInputField = document.getElementById('grey-input-field');

// Create a new input field whenever there is text input to greyInputField
greyInputField.addEventListener('input', function() {
    createNewInputField(greyInputField.value).focus();
    greyInputField.value = '';
})

resetInputField();

// Creates a new vector input field
function createNewInputField(text) {
    let newField = document.createElement('input');
    newField.className = 'input-field';
    newField.placeholder = '0';
    
    // If creation text is passed through, assign it to the field
    if(text) {
        newField.value = text;
    }

    // Listen for delete or backspace to delete the field
    newField.addEventListener('keydown', function(event) {
        if ((event.key == 'Delete' || event.key == 'Backspace') && this.value == '') {
            if (this.previousSibling.focus) {
                this.previousSibling.focus()
            } else if (this.nextSibling.focus) {
                this.nextSibling.focus()
            }
            this.remove();
        }
    })

    let container = document.getElementById('input-field-container');
    container.insertBefore(newField, container.children[container.children.length - 1]);
    return newField;
}

function resetInputField() {
    let fields = document.querySelectorAll('.input-field');

    for (let ii = 0; ii < fields.length; ++ii) {
        fields[ii].remove();
    }

    createNewInputField('');

}

function isInputFieldEmpty()
{
    let fields = document.querySelectorAll('.input-field');

    for (let ii = 0; ii < fields.length; ++ii) {
        if (fields[ii].value != '')
        {
            return false;
        }
    }
    return true;
}






////////////////////////////////////////////////////////////////////////////////////////////
// OPERATOR BUTTONS BEHAVIOUR

const buttonsContainer = document.querySelector('.buttons-container');


// When a button is clicked
buttonsContainer.addEventListener('click', (event) => {
    
    const target = event.target.closest('button');

    if (target.classList.contains('operator')) {

        handleOperator(target);

    }

    if (target.classList.contains('all-clear')) {
        resetInputField();
        calculator.firstOperand = [];
        calculator.operator = null;
        displayCurrentOperator('');
    }

    if (target.classList.contains('equal-sign')) {
        handleEquals();
    }
})

function handleOperator(target) {
    
    if (target.value == 'magnitude') {
        if (isInputFieldEmpty()) {
            displayVector(calculator.firstOperand, '|v|');
            calculator.firstOperand = [ math.vectorMagnitude(calculator.firstOperand) ];
        } else {
            displayVector(getInputAsVector(), '|v|');
            calculator.firstOperand = [ math.vectorMagnitude(getInputAsVector()) ];
        }

        displayVector(calculator.firstOperand, '=');
        calculator.operator = '=';
        resetInputField();
        return;
    }

    if (target.value == 'multiply-scalar') {
        if (!isInputFieldEmpty()) {
            calculator.firstOperand = getInputAsVector();
        } 

        calculator.firstOperand = math.vectorScalarMultiple

        displayVector(calculator.firstOperand, '=');
        calculator.operator = '=';
        resetInputField();
        return;
    }


    if (calculator.operator == 'dot-product' || calculator.operator == 'cross-product')
    {
        handleEquals();
        alert('equals handled')
    }

    if (calculator.operator == '=' && !isInputFieldEmpty()) {
        calculator.firstOperand = getInputAsVector();
        displayVector(calculator.firstOperand);
    }
    else if (calculator.operator == '=')
    {
        displayVector(calculator.firstOperand, '');
    }

    // Calculate previous values
    else if (calculator.firstOperand.length > 0) {
        let inputVector = getInputAsVector();
        calculator.firstOperand = calculate(calculator.firstOperand, inputVector, target.value);
        displayVector(inputVector, getOperatorSymbol(target.value))

    } else if (!isInputFieldEmpty()) {
        calculator.firstOperand = getInputAsVector();
        displayVector(calculator.firstOperand, '')
    } 
    // Unhandled case
    else {
        return;
    }

    calculator.operator = target.value;

    displayCurrentOperator(getOperatorSymbol(target.value));

    resetInputField();

    return;
}

function showErrorAlert(header, msg)
{
    alert(header + ': ' + msg);
}

function handleEquals() {
    if (calculator.operator == '=') {
        return;
    } 
    calculator.firstOperand = calculate(calculator.firstOperand, getInputAsVector(), calculator.operator);
    displayVector(getInputAsVector(), getOperatorSymbol(calculator.operator))
    displayVector(calculator.firstOperand, '=')
    calculator.operator = '=';
    resetInputField();
    displayCurrentOperator('');
}

function calculate(operand1, operand2, operator) {
    switch (operator) 
    {
        case ('add'):
            return math.vectorSum(operand1, operand2);
        case ('subtract'):
            return math.vectorSubtract(operand1, operand2);
        case ('dot-product'):
            return [ math.vectorDotProduct(operand1, operand2) ];
        case ('cross-product'):
            if (operand1.length != 3 || operand2.length != 3) {
                showErrorAlert('Math error', 'cross-product vectors must be 3-dimensional.')
            }
            return math.vectorCrossProduct(operand1, operand2);
    }
}

function displayVector(vector, prefix) {
    
    if (vector == '' || vector == NaN || vector == null || vector.length == 0) {
        let outputElement = document.createElement('p');
        outputElement.textContent = 'Error';
        document.querySelector('.output-window').append(outputElement);
    } 

    let resultString = [ prefix + ' ', '(' ];

    for (let ii = 0; ii < vector.length; ++ii) {
        resultString.push(vector[ii])

        if (ii != vector.length - 1) {
            resultString.push(', ');
        }
    }

    resultString.push(')');

    let outputElement = document.createElement('p');
    outputElement.textContent = resultString.join('');
    document.querySelector('.output-window').append(outputElement);

    calculator.history.push(resultString.join(''));
}

function getInputAsVector() {
    let fields = document.querySelectorAll('.input-field');

    let inputVector = [];

    for (let ii = 0; ii < fields.length; ++ii) {
        inputVector[ii] = parseFloat(fields[ii].value);
    }

    return inputVector;
}

function displayCurrentOperator(operator)
{
    document.getElementById('current-operator').innerText = operator;
}

function getOperatorSymbol(operator) {
    switch(operator) {
        case ('add'):
            return '+';
        case ('subtract'):
            return '-';
        case ('cross-product'):
            return '×';
        case ('magnitude'):
            return '|v|';
        case ('dot-product'):
            return '⋅';
        default:
            return operator;
    }
}

