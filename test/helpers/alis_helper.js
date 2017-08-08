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
export const AlisCrowdsale = artifacts.require('AlisCrowdsale.sol');
export const cap = alis(crowdsaleParams.cap); // TODO: use BigNumber
export const rate = new BigNumber(crowdsaleParams.rate);
export const alisFundAddress = crowdsaleParams.alisFundAddress;
export const initialAlisFundBalance = alis(crowdsaleParams.initialAlisFundBalance);
export const goal = new BigNumber(crowdsaleParams.goal);

// Set time to after week4 when token rate is base.
export async function setTimingToBaseTokenRate() {
  // TODO: refactoring
  const now = await Math.floor(Date.now() / 1000);
  const increaseDuration = 1504231200 - now;
  await increaseTime(moment.duration(increaseDuration + 100, 'second'));
}
