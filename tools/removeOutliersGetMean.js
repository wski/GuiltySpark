const _ = require('lodash')
const stats = require('stats-analysis')
const {
  priceDiffBuffer,
  base,
  whitelist
} = require('../configs/general')

module.exports = function (coins) {
  const cleansedOfOutliers = {}

  Object.keys(coins).map(coin => {
    cleansedOfOutliers[coin] = {
      bid: stats.filterOutliers(coins[coin].bid),
      ask: stats.filterOutliers(coins[coin].ask),
      last: stats.filterOutliers(coins[coin].last)
    }

    if (cleansedOfOutliers[coin].last.length === 2) {
      const percent = (cleansedOfOutliers[coin].last[0] * 100) / cleansedOfOutliers[coin].last[1]
      if (percent > 100 + priceDiffBuffer || percent < 100 - priceDiffBuffer) {
        if (
            !global.GuiltySparkGlobals.disabledAssets.includes(coin) &&
            coin !== base &&
            !whitelist.includes(coin)
          ) {
          global.GuiltySparkGlobals.disabledAssets.push(coin)
        }
      } else {
        if (global.GuiltySparkGlobals.disabledAssets.includes(coin)) {
          global.GuiltySparkGlobals.disabledAssets = global.GuiltySparkGlobals.disabledAssets.filter(e => e !== coin)
        }
      }
    } else if (cleansedOfOutliers[coin].last.length === 1 || !cleansedOfOutliers[coin].last.length) {
      if (
          !global.GuiltySparkGlobals.disabledAssets.includes(coin) &&
          coin !== base &&
          !whitelist.includes(coin)
        ) {
        global.GuiltySparkGlobals.disabledAssets.push(coin)
      }
    } else if (global.GuiltySparkGlobals.disabledAssets.includes(coin)) {
      global.GuiltySparkGlobals.disabledAssets = global.GuiltySparkGlobals.disabledAssets.filter(e => e !== coin)
    }

    cleansedOfOutliers[coin] = {
      bid: _.mean(cleansedOfOutliers[coin].bid),
      ask: _.mean(cleansedOfOutliers[coin].ask),
      last: _.mean(cleansedOfOutliers[coin].last)
    }
  })
  return cleansedOfOutliers
}
