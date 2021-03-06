![GuiltySpark](https://68.media.tumblr.com/fb52df3ad899cb09fe0cf66138a238e9/tumblr_nhs5bn092o1riec8co5_400.gif)
# GuiltySpark

GuiltySpark is an oracle that can help guide you through the flood outbreak, GuiltySpark is also an oracle that pushes asset prices to the chain.

## Contributing

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

We use JS Standard, please install eslint and correct ESLint errors where reasonable. 


## Use It!
Simply use 
```
npm i && npm run full
```
If you're not using a public node please also make sure TestRPC is running.

## The API

### `/v1/coins`
Returns a list of supported assets

### `/v1/datapoints` 
Returns a list of the datapoints used in aggrigation

### `/v1/market`
Get a list of the market data over HTTP

## Websockets

You can also access market data in real time via websockets. E.g.

```js
const WebSocket = require('ws')
 
const ws = new WebSocket('ws://localhost:3009')
 
ws.on('message', function incoming(data) {
  console.log(data)
})
```

## On Chain Methods

### Public
#### GuiltySpark.getAsset(bytes8 asset)
Returns an asset from the oracle 
```
returns (uint, uint, uint, uint) // bid, ask, last, time
```
#### GuiltySpark.getAssets(bytes8[] assets)
Returns a list of assets from the oracle
```
returns (bytes8[], uint[], uint[], uint[], uint) // assets, bids, asks, lasts, time
```

### Owner Only
#### GuiltySpark.updateMarket(bytes8[] assets, uint[] bids, uint[] asks, uint[] lasts)
Update the oracle prices

#### GuiltySpark.close()
Selfdestruct the oracle contract


## Notable things

Fair oracle can be run in `liteMode` to conserve gas by only updating the last market price instead of including `bid` and `ask` as well.
