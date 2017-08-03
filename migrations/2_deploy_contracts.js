const fs = require('fs');

const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));

// FIXME: merge to utility.
function alis(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = function deployContracts(deployer) {
  const actualCap = alis(crowdsaleParams.cap);
  const actualInitialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);

  deployer.deploy(AlisCrowdsale, crowdsaleParams.startBlock, crowdsaleParams.endBlock, crowdsaleParams.rate,
    crowdsaleParams.alisFundAddress, actualCap, actualInitialAlisFundBalance);
};
