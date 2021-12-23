require('babel-register') ({
    presets: [ 'env' ]
})
require("babel-polyfill");


module.exports = require("./get_tts.js")