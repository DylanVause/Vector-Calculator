///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


const fs = require('fs');

module.exports.readConfig = readConfig;
module.exports.writeConfig = writeConfig;
module.exports.readEULA = readEULA;

const saveFilePath = './config.json';

function readConfig(callback) {
    try {

        if (fs.existsSync(saveFilePath)) {
            fs.readFile(saveFilePath, null, (err, data) => {
                try {
                    let config = JSON.parse(data);
                    if (config.decimalPoints != null && config.keepOnTop != null) {
                        callback(config)
                    }
                } catch (err) {
                    writeConfig({
                        decimalPoints: 4,
                        keepOnTop: false,
                        angleMode: 'deg',
                        showAdvancedErrors: false
                    })
                    callback({
                        decimalPoints: 4,
                        keepOnTop: false,
                        angleMode: 'deg',
                        showAdvancedErrors: false
                    })
                }
            })
        } else {
            writeConfig({
                decimalPoints: 4,
                keepOnTop: false,
                angleMode: 'deg',
                showAdvancedErrors: false
            })
            callback({
                decimalPoints: 4,
                keepOnTop: false,
                angleMode: 'deg',
                showAdvancedErrors: false
            })
        }

    } catch (err) {
        alert('File Management Error (1): ' + err)
    }

}

function writeConfig(configObject) {
    try {

        fs.writeFile(saveFilePath, JSON.stringify(configObject), (err) => {
            if (err) {
                alert('File Management Error (2): ' + err)
            }
        })
    } catch (err) {
        alert('File Management Error (3): ' + err)
    }
}

function readEULA(callback) {
    try {
        fs.readFile('./EULA.txt', 'utf8', (err, data) => {
            callback(data)
        })
    } catch (error) {
        alert('File Management Error (4): ' + err)
    }
}