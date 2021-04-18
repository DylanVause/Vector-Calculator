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

    document.getElementById('menu-close-button').addEventListener('click', (event) => {
        window.parent.postMessage({ message: 'close-menu' })
    })

    const precisionInputField = document.getElementById('decimal-points-input')
    precisionInputField.lastValidValue = '';
    precisionInputField.addEventListener('change', (event) => {
        if (!isNaN(precisionInputField.value) &&
            Number.isInteger(Number.parseFloat(precisionInputField.value)) &&
            (Number.parseInt(precisionInputField.value) <= 8) &&
            (Number.parseInt(precisionInputField.value) >= 0)
        ) {
            precisionInputField.lastValidValue = precisionInputField.value;
            updateConfigFile();
        } else {
            precisionInputField.value = precisionInputField.lastValidValue;
        }
    })

    const keepOnTopInput = document.getElementById('keep-on-top-input')
    keepOnTopInput.addEventListener('change', (event) => {
        updateConfigFile();
    })

    document.getElementById('advanced-error-input').addEventListener('change', (event) => {
        updateConfigFile();
    })

    document.getElementById('eula-button').addEventListener('click', () => {
        window.parent.postMessage({
            message: 'read-eula'
        })
    })

    document.getElementById('close-eula').addEventListener('click', () => {
        document.getElementById('eula-popup').hidden = true;
    })

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