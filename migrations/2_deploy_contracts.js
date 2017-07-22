const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const initParams = JSON.parse(fs.readFileSync('../config/AlisToken.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  deployer.deploy(AlisToken, initParams.amount, initParams.name, initParams.decimal, initParams.symbol);
};
