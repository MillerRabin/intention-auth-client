const assert = require('assert');
const { IntentionStorage } = require('intention-storage');
const iMain = require('../main.js');
describe('Get Keys', function() {
    let intentionStorage = null;

    describe('Prepare intention storage', function () {
        it ('Create storage', async function () {
            intentionStorage = new IntentionStorage();
            const link = intentionStorage.addLink([
                { name: 'WebAddress', value: 'localhost'},
                { name: 'IPPort', value: '10011'}
            ]);
            await link.waitConnection();
        });
    });

    describe('Init', function() {
        const storedKeys = {};

        it('Should start requesting keys', function() {
            iMain.startRequestingKeys(intentionStorage);
            assert.notStrictEqual(iMain.data.iAuth, null);
        });

        it('Wait keys receiving', function (done) {
            iMain.on.keysRequested = function () {
                return null;
            };

            iMain.on.keysReceived = function (origin, keys) {
                storedKeys[origin] = keys;
                done();
            }
        });

        it('Check keys', function () {
            const conf = storedKeys['ws://localhost:10011'];
            assert.notEqual(conf, null);
            assert.notEqual(conf.public, null);
            assert.notEqual(conf.private, null);
            assert.notEqual(conf.id, null);
        });
    });

    describe('Close', function () {
        it ('should unload module', function () {
            iMain.stopRequestingKeys(intentionStorage);
        });

        it('close', function () {
            intentionStorage.close();
        });
    });
});