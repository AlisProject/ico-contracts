const fs = require('fs');

const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));
const rate = crowdsaleParams.rate;

// FIXME: merge to utility.
function alis(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = function deployContracts(deployer) {
  const actualCap = alis(crowdsaleParams.cap);
  const actualInitialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);

  deployer.deploy(AlisCrowdsale, crowdsaleParams.startBlock, crowdsaleParams.endBlock,
    rate.base, crowdsaleParams.alisFundAddress, actualCap,
    actualInitialAlisFundBalance, crowdsaleParams.goal,
    rate.preSale, rate.week1, rate.week2, rate.week3);
};
