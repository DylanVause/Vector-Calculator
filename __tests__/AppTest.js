//This is broken will fix when we need testing framework
//const assert = require('assert')
//const path = require('path')
//const { Application } = require('spectron')
//const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
//const baseDir = path.join(__dirname, './')
//
//const sleep = time => new Promise(r => setTimeout(r, time))
//
//describe('Application launch', function () {
//    //this.timeout(30000)
//
//    const app = new Application({
//        path: electronPath,
//        args: [baseDir]
//    })
//
//    before(function () { app.start() })
//
//    after(function () { app.stop() })
//
//    it('show an initial window', async function () {
//        await app.client.waitUntilWindowLoaded();
//        const count = await app.client.getWindowCount();
//        assert.equal(count, 1)
//    })
//})