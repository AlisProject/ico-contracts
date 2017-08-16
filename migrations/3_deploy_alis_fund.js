const fs = require('fs');

const AlisFund = artifacts.require('AlisFund.sol');
const fundParams = JSON.parse(fs.readFileSync('../config/AlisFund.json', 'utf8'));

module.exports = function deployContracts(deployer) {
  // First of all please deploy it in split.
  // deployer.deploy(AlisFund, fundParams.owners, fundParams.required);
};
