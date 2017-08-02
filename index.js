const normalize = require('crypto-normalize')
const redis     = require('redis')
const client    = redis.createClient()
const Web3      = require('web3')
const chalk     = require('chalk')

const { 
    exchanges,
    feedInterval,
    base,
    supportedCurrencies,
    apiEnabled,
    redisEnabled,
    web3Provider
} = require('./configs/general')

// Setup web3
const web3 = new Web3()
web3.setProvider(
    new web3.providers.HttpProvider(web3Provider)
)
console.log(chalk.green(`Connected to web3 with provider: ${web3Provider}`))

global.publish = () => { /* noop */ }

if (apiEnabled) require('./api')

const dispatch = function(marketData) {
    logger(marketData)

    if (apiEnabled) publish(marketData)
    if (redisEnabled) client.set(
        'market',
        JSON.stringify(marketData),
        redis.print
    )
    
    const solidityReady = prepForSolidity(marketData)
    console.log(solidityReady)
}

// Pretty log data to console 
const logger = require('./tools/logger')

// Removes extreme outliers
const removeOutliersGetMean = require('./tools/removeOutliersGetMean')

// Join all exchanges into array values 
const format = require('./tools/format')

// This prepares all the data into the format the solidity contract expects
const prepForSolidity = require('./tools/prepareForSolidity')

// Primary function which kicks off feeding the chain new price data
const feed = function() {
    // Ready promises for fetching market data on all currencies
    const coins = supportedCurrencies.map(currency => {
        return new Promise((resolve, reject) => {
            // Get ticker valeus for currency on all supported exchanges
            const tickers = Promise.all(
                exchanges.map(exchange => normalize.ticker(
                    currency, 
                    base, 
                    exchange
                ))
            )

            // Assign the market data to the appropriot exchange
            tickers.then(values => {
                const markets = {}

                values.map((value, i) => {
                    markets[exchanges[i]] = value
                })

                // Resolve a list of market values for givin currency
                resolve({
                    [currency]: markets
                })
            })
        })
    })

    // Finally, get all markets for all coins
    const marketData = Promise.all(coins).then(markets => {
        const chainData = removeOutliersGetMean(
            format(markets)
        )

        dispatch(chainData)
        // TODO: push chaindata to chain
    })
}

feed()
setInterval(feed, feedInterval)