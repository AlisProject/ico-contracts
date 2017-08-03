const fs = require('fs');

const AlisToken = artifacts.require('AlisToken.sol');
const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

// FIXME: merge to utility.
function alis(n) {
  return new web3.BigNumber(n).mul(10 ** 18);
}

module.exports = function deployContracts(deployer) {
  const actualCap = alis(crowdsaleParams.cap);
  const actualInitialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);

  // TODO: start & end block.
  deployer.deploy(AlisCrowdsale, 900000, 1000000, crowdsaleParams.rate,
    crowdsaleParams.alisFundAddress, actualCap, actualInitialAlisFundBalance);
};
