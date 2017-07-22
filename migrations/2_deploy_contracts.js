const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const initParams = JSON.parse(fs.readFileSync('../config/AlisToken.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  const actualInitialAmount = initParams.initialAmount * (10 ** initParams.decimal);
  const actualOfferedAmount = initParams.offeredAmount * (10 ** initParams.decimal);

  deployer.deploy(AlisToken, actualInitialAmount, initParams.name, initParams.decimal, initParams.symbol,
    actualOfferedAmount);
};
