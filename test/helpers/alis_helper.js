import moment from 'moment';
import alis from '../../utilities/alis';
import increaseTime from '../helpers/increaseTime';

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
export const AlisFund = artifacts.require('AlisFund.sol');
export const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
export const icoStartTime = crowdsaleParams.icoStartTime;
export const cap = crowdsaleParams.cap;
export const tokenCap = crowdsaleParams.tokenCap;
export const rate = crowdsaleParams.rate;
export const initialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);
export const goal = new BigNumber(crowdsaleParams.goal);
export const whiteList = crowdsaleParams.whiteList;

// Set time to token sale start time.
export async function setTimingToTokenSaleStart() {
  const now = await Math.floor(Date.now() / 1000);
  const increaseDuration = icoStartTime - now;
  await increaseTime(moment.duration(increaseDuration, 'second'));
}

// Set time to after week4 when token rate is base.
export async function setTimingToBaseTokenRate() {
  await setTimingToTokenSaleStart();
  await increaseTime(moment.duration(3, 'weeks'));
}
