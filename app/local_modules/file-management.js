///////////////////////////////////////
// Copyright © 2021 Dylan Vause.  All rights reserved.
//


const fs = require('fs');
const saveFP = "./config.json"
const license = "./LICENSE"

// This is the default configuration to use if there is none available, or if the current one needs repair
const defaultConfig = {
    decimalPoints: 4,
    keepOnTop: false,
    angleMode: 'deg',
    showAdvancedErrors: false
}

// Functions marked for use by external scripts
module.exports.readConfig = readConfig;
module.exports.writeConfig = writeConfig;
module.exports.readEULA = readEULA;

// Read the config file and pass the config object as an argument to a callback function
function readConfig(callback) {
    try {

        if (fs.existsSync(saveFP)) {
            fs.readFile(saveFP, null, (err, data) => {
                try {
                    let config = JSON.parse(data);
                    if (isConfigValid(config)) {
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

// Write a config object to file
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

//  Read the end user license agreement from file and pass the text to a callback function.  
function readEULA(callback) {
    try {
        fs.readFile(license, 'utf8', (err, data) => {
            callback(data)
        })
    } catch (error) {
        alert(err)
    }
}

/** Repairs the config file if there are any missing config properties (this can happen if an update adds to the config properties).
*/
function repairConfig()
{
    if (fs.existsSync(saveFP))
    {
        fs.readFile(saveFP, null, (err, data) => {
            try {
                // Repair any missing properties in the config file
                // We repair missing properties one-by-one instead of completely rewriting in order to preserve most user settings.
                // In the future, we should make this match the default config properties automatically for better code maintenance.
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