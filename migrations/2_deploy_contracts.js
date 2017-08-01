const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  // TODO: improve decimal calculation.
  const actualCap = crowdsaleParams.cap * (10 ** 18);
  // const actualOfferedAmount = crowdsaleParams.offeredAmount * (10 ** tokenParams.decimal);

  deployer.deploy(AlisToken);
  deployer.link(AlisToken, AlisCrowdsale);
  // TODO: start & end block.
  deployer.deploy(AlisCrowdsale, 900000, 1000000, crowdsaleParams.rate,
    crowdsaleParams.fundAddress, actualCap);
};
