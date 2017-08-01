const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
// TODO:
// const tokenParams = JSON.parse(fs.readFileSync('../config/AlisToken.json', 'utf8'));
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  // TODO:
  // const actualInitialAmount = tokenParams.initialAmount * (10 ** tokenParams.decimal);
  // const actualOfferedAmount = crowdsaleParams.offeredAmount * (10 ** tokenParams.decimal);

  deployer.deploy(AlisToken);
  deployer.link(AlisToken, AlisCrowdsale);
  // TODO: start & end block.
  deployer.deploy(AlisCrowdsale, 900000, 1000000, crowdsaleParams.initialRate, crowdsaleParams.fundAddress, 500000000);
};
