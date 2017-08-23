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
  const actualCap = web3.toWei(crowdsaleParams.cap, 'ether');
  const actualTokenCap = alis(crowdsaleParams.tokenCap);
  const actualInitialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);
  const actualGoal = web3.toWei(crowdsaleParams.goal, 'ether');

  deployer.deploy(AlisFund, fundParams.owners, fundParams.required).then(() =>
    // Set AlisFund address to wallet of AlisCrowdsale.
    deployer.deploy(AlisCrowdsale, crowdsaleParams.startBlock, crowdsaleParams.icoStartTime,
      crowdsaleParams.endBlock, rate.base, AlisFund.address, actualCap, actualTokenCap,
      actualInitialAlisFundBalance, actualGoal, crowdsaleParams.whiteList,
    ));
};
