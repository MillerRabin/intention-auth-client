const path = require('path');
const fs = require('fs').promises;

const keysDir = '.keys';

exports.data = {
    iAuth: null
};

exports.on = {
    keysRequested: null,
    keysReceived: null
};

exports.loadKeys = async (keyPath) => {
    const fname = (keyPath == null) ? path.join(__dirname, keysDir) : keyPath;
    const files = await fs.readdir(fname);
    const promises = [];
    for (const file of files)
        promises.push(fs.readFile(path.join(fname, file), 'utf8')
            .then(d => exports.data.keys[file] = JSON.parse(d))
            .catch(() => null));
    return await Promise.all(promises)
};

function getOriginName(origin) {
    const parts = origin.split('://');
    const fname = (parts[1] == null) ? parts[0] : parts[1];
    return fname.replace(/:/gi, '-');
}

function throwError(text) {
    throw new Error(text);
}

exports.saveKeys = async (
    keyPath,
    origin = throwError('Origin is not defined'),
    keys = throwError('Keys is not defined')
) => {
    const keyName = getOriginName(origin);
    const fpath = (keyPath == null) ? path.join(__dirname, keysDir) : keyPath;
    await fs.mkdir(fpath, { recursive: true });
    const fname = path.join(fpath, keyName);
    await fs.writeFile(fname, JSON.stringify(keys));
};

function requestingKeys(intentionStorage) {
    exports.data.iAuth = intentionStorage.createIntention({
        title: 'Need authenticate keys',
        input: 'AuthKeys',
        output: 'AuthData',
        enableBroadcast: false,
        onData: async (status, intention, value) => {
            if (status == 'accepting') {
                if (exports.on.keysRequested == null)
                    throw new Error('on.keysRequested is undefined');
                if (exports.on.keysReceived == null)
                    throw new Error('on.keysReceived is undefined');
                const keys = await exports.on.keysRequested(intention.origin);
                if (keys != null)
                    throw new Error('Keys already received');
            }
            if (status == 'data')
                if (exports.on.keysReceived != null)
                    await exports.on.keysReceived(intention.origin, value);
        }
    });
    return exports.data.iAuth;
}

exports.startRequestingKeys = (intentionStorage) => {
    requestingKeys(intentionStorage);
};

exports.stopRequestingKeys = function (intentionStorage) {
    intentionStorage.deleteIntention(exports.data.iAuth);
};