const fs = require('fs');

const AlisFund = artifacts.require('AlisFund.sol');
const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
const fundParams = JSON.parse(fs.readFileSync('../config/AlisFund.json', 'utf8'));
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'));
const rate = crowdsaleParams.rate;

// FIXME: merge to utility.
function alis(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = function deployContracts(deployer) {
  const actualCap = alis(crowdsaleParams.cap);
  const actualInitialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);
  const actualGoal = web3.toWei(crowdsaleParams.goal, 'ether');

  deployer.deploy(AlisFund, fundParams.owners, fundParams.required).then(() =>
    deployer.deploy(AlisCrowdsale, crowdsaleParams.startBlock, crowdsaleParams.endBlock,
      rate.base, AlisFund.address, actualCap,
      actualInitialAlisFundBalance, actualGoal,
      rate.preSale, rate.week1, rate.week2, rate.week3));
};
