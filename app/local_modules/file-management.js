///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


const fs = require('fs');
const saveFP = "./config.json"
const license = "./LICENSE"

module.exports.readConfig = readConfig;
module.exports.writeConfig = writeConfig;
module.exports.readEULA = readEULA;

function readConfig(callback) {
    try {

        if (fs.existsSync(saveFP)) {
            fs.readFile(saveFP, null, (err, data) => {
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

        fs.writeFile(saveFP, JSON.stringify(configObject), (err) => {
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
        fs.readFile(license, 'utf8', (err, data) => {
            callback(data)
        })
    } catch (error) {
        alert(err)
    }
}