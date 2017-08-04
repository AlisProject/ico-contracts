import alis from '../../utilities/alis';

const fs = require('fs');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiBigNumber = require('chai-bignumber');

const crowdsaleParams = JSON.parse(fs.readFileSync('./config/Crowdsale.json', 'utf8'));

// exports

export const BigNumber = web3.BigNumber;
export const should = chai
  .use(chaiAsPromised)
  .use(chaiBigNumber(BigNumber))
  .should();

export const AlisToken = artifacts.require('AlisToken.sol');
export const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
export const cap = alis(crowdsaleParams.cap); // TODO: use BigNumber
export const rate = new BigNumber(crowdsaleParams.rate);
export const alisFundAddress = crowdsaleParams.alisFundAddress;
export const initialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);
export const goal = new BigNumber(crowdsaleParams.goal);
