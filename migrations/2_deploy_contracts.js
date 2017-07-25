const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');
const tokenParams = JSON.parse(fs.readFileSync('../config/AlisToken.json', 'utf8'));
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  const actualInitialAmount = tokenParams.initialAmount * (10 ** tokenParams.decimal);

  return deployer.deploy(AlisToken, actualInitialAmount, tokenParams.name, tokenParams.decimal,
    tokenParams.symbol).then(
    () => deployer.deploy(Crowdsale, AlisToken.address, crowdsaleParams.fundAddress, crowdsaleParams.offeredAmount,
      crowdsaleParams.initialRate));
};
