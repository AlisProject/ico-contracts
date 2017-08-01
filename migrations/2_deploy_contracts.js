const fs = require('fs');

const BigNumber = web3.BigNumber;

const AlisToken = artifacts.require('AlisToken.sol');
const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  // TODO: improve decimal calculation.
  const actualCap = crowdsaleParams.cap * (10 ** 18);
  const actualInitialAlisFundBalance = new BigNumber(crowdsaleParams.initialAlisFundBalance).mul(10 ** 18);

  deployer.deploy(AlisToken);
  deployer.link(AlisToken, AlisCrowdsale);
  // TODO: start & end block.
  deployer.deploy(AlisCrowdsale, 900000, 1000000, crowdsaleParams.rate,
    crowdsaleParams.alisFundAddress, actualCap, actualInitialAlisFundBalance);
};
