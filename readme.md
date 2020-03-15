# Intention Auth Client
Is used for requesting authentication keys from auth intention

## on.keysRequested(origin)
Called when keys for auth node is requested. 
If you trust that node - return stored keys, to authentication process.
If null is returned, it means that you trust the node but you have no keys stored for it.
If you don't trust the node, then throw an exception. The acceptance process will rejected;
 
## on.keysReceived(origin, keys)
Called when keys from auth node is received.
Save it for further usage.   


## Usage
Start receiving keys from auth nodes
```javascript
    const iAuth = require('intention-auth-client');
    const { IntentionStorage } = require('intention-storage');
    const intentionStorage = new IntentionStorage();
    
    iAuth.on.keysRequested = function (origin) {
        return findKeys(origin);
    };
    
    iAuth.on.keysReceived = function (origin, keys) {
        saveKeys(origin, keys);
    };
    
    iAuth.startRequestingKeys(intentionStorage);   
```

Stop receiving keys from auth nodes
```javascript
    iAuth.stopRequestingKeys(intentionStorage);   
```
