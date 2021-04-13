///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


const fs = require('fs');

module.exports.readConfig = readConfig;
module.exports.writeConfig = writeConfig;
module.exports.readEULA = readEULA;

function readConfig(callback) {
    try {

        if (fs.existsSync('./saves/config.json')) {
            fs.readFile('./saves/config.json', null, (err, data) => {
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
        alert(err)
    }

}

function writeConfig(configObject) {
    try {

        fs.writeFile('./saves/config.json', JSON.stringify(configObject), (err) => {
            if (err) {
                alert(err)
            }
        })
    } catch (err) {
        alert(err)
    }
}

function readEULA(callback) {
    try {
        fs.readFile('./EULA.txt', 'utf8', (err, data) => {
            callback(data)
        })
    } catch (error) {
        alert(err)
    }
}