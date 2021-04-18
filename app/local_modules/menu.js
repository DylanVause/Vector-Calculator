///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


try {

    // Show the version number read from package.json in the menu
    const ipcRenderer = window.parent.ipcRenderer;
    const version = ipcRenderer.sendSync('get-version');
    document.getElementById('version').innerText = 'Vector Calculator ' + version;

    // Handle messages from the menu
    window.parent.addEventListener('message', function (event) {
        switch (event.data.message) {
            case ('initialize-menu-fields'):
                document.getElementById('decimal-points-input').value = document.getElementById('decimal-points-input').lastValidValue = event.data.config.decimalPoints;
                document.getElementById('keep-on-top-input').checked = event.data.config.keepOnTop;
                document.getElementById('advanced-error-input').checked = event.data.config.showAdvancedErrors;
                break;
            case ('show-eula'):
                document.getElementById('eula-text').innerText = event.data.eulaText;
                document.getElementById('eula-popup').hidden = false;
                break;

        }
    })

    // Build a config object from the values inputted, then send a message to main.js to save the config object to file.
    function updateConfigFile() {
        let decimalPoints = document.getElementById('decimal-points-input').value;
        let keepOnTop = document.getElementById('keep-on-top-input').checked;
        let showAdvancedErrors = document.getElementById('advanced-error-input').checked;
        let config = {
            decimalPoints: Number.parseInt(decimalPoints),
            keepOnTop: keepOnTop,
            showAdvancedErrors: showAdvancedErrors
        }

        window.parent.postMessage({
            message: 'update-config',
            config: config
        })
    }

    /* Functionality for closing the menu.  This could probably be done without sending a message to main.js, but that
       would require getting the document element that hosts the window in index.html.  Using a message is probably easier.
    */
    document.getElementById('menu-close-button').addEventListener('click', (event) => {
        window.parent.postMessage({ message: 'close-menu' })
    })

    // Handles clamping the precision input field to a fixed int between zero and a max value.
    // Be sure that this max value is not so high that rounding errors make the result inaccurate.  8 is the recommend value.
    const maxPrecision = 8;
    const precisionInputField = document.getElementById('decimal-points-input')
    precisionInputField.lastValidValue = '';
    precisionInputField.addEventListener('change', (event) => {
        if (!isNaN(precisionInputField.value) &&
            Number.isInteger(Number.parseFloat(precisionInputField.value)) &&
            (Number.parseInt(precisionInputField.value) <= maxPrecision) &&
            (Number.parseInt(precisionInputField.value) >= 0)
        ) {
            precisionInputField.lastValidValue = precisionInputField.value;
            updateConfigFile();
        } else {
            precisionInputField.value = precisionInputField.lastValidValue;
        }
    })

    // Handles clicking the keep on top checkmark
    const keepOnTopInput = document.getElementById('keep-on-top-input')
    keepOnTopInput.addEventListener('change', (event) => {
        updateConfigFile();
    })

    // Handles clicking the advanced errors checkmark
    document.getElementById('advanced-error-input').addEventListener('change', (event) => {
        updateConfigFile();
    })

    /* Sends a message to main.js to retrieve the EULA.  This could later be implemented right here instead of through main.js,
     * now that ipcRenderer is available to use in this script.
    */
    document.getElementById('eula-button').addEventListener('click', () => {
        window.parent.postMessage({
            message: 'read-eula'
        })
    })

    // Hides the EULA popup
    document.getElementById('close-eula').addEventListener('click', () => {
        document.getElementById('eula-popup').hidden = true;
    })

    // + and - buttons for mainpulating the decimal precision input field 
    document.getElementById('subtract-decimal-point').addEventListener('click', () => {
        try {
            precisionInputField.value = Number.parseInt(precisionInputField.value) - 1;
            precisionInputField.dispatchEvent(new Event('change'));
        } catch (err) {
            alert(err)
        }
    })
    document.getElementById('add-decimal-point').addEventListener('click', () => {
        try {
            precisionInputField.value = Number.parseInt(precisionInputField.value) + 1;
            precisionInputField.dispatchEvent(new Event('change'));
        } catch (err) {
            alert(err)
        }
    })


} catch (err) {
    alert(err)
}