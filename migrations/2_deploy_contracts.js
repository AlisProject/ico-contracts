const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');
const initParams = JSON.parse(fs.readFileSync('../config/AlisToken.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  const actualInitialAmount = initParams.initialAmount * (10 ** initParams.decimal);
  const actualOfferedAmount = initParams.offeredAmount * (10 ** initParams.decimal);

  // FIXME
  const fund = '0x0000000000000000000000000000000000000000';

  return deployer.deploy(AlisToken, actualInitialAmount, initParams.name, initParams.decimal,
    initParams.symbol, actualOfferedAmount).then(() => deployer.deploy(Crowdsale, AlisToken.address, fund));
};
