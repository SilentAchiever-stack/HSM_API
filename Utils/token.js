const crypto = require('crypto')

const Token = async()=>{
  return crypto.randomBytes(32).toString('hex')
}

module.exports = {Token}