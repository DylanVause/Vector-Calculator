///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


const fs = require('fs');
const saveFP = "./config.json"
const license = "./LICENSE"
const defaultConfig = {
    decimalPoints: 4,
    keepOnTop: false,
    angleMode: 'deg',
    showAdvancedErrors: false
}

module.exports.readConfig = readConfig;
module.exports.writeConfig = writeConfig;
module.exports.readEULA = readEULA;

function readConfig(callback) {
    try {

        if (fs.existsSync(saveFP)) {
            fs.readFile(saveFP, null, (err, data) => {
                try {
                    let config = JSON.parse(data);
                    if (isConfigValid()) {
                        callback(config)
                    }
                    else 
                    {
                        repairConfig();
                        readConfig(callback);
                    }
                } catch (err) {
                    repairConfig();
                    callback(defaultConfig);
                }
            })
        } else {
            repairConfig();
            callback(defaultConfig);
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

function repairConfig()
{
    if (fs.existsSync(saveFP))
    {
        fs.readFile(saveFP, null, (err, data) => {
            try {
                // Repair any missing properties in the config file
                let config = JSON.parse(data);
                if (config.decimalPoints == null)
                {
                    config.decimalPoints = defaultConfig.decimalPoints;
                }
                if (config.keepOnTop == null)
                {
                    config.keepOnTop = defaultConfig.keepOnTop;
                }
                if (config.angleMode == null)
                {
                    config.angleMode = defaultConfig.angleMode;
                }
                if (config.showAdvancedErrors == null)
                {
                    config.showAdvancedErrors = defaultConfig.showAdvancedErrors;
                }
                writeConfig(config);
            } 
            // If there is an error for some reason, just write a new config
            catch {
                writeConfig(defaultConfig)
            }
        })
    } 
    // If a config file cannot be found, just write a default one
    else 
    {
        writeConfig(defaultConfig)
    }
}

function isConfigValid(config)
{
    return config.decimalPoints != null && config.angleMode != null && config.showAdvancedErrors != null && config.keepOnTop != null;
}