import moment from 'moment';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import increaseTime from './helpers/increaseTime';

import {
  AlisCrowdsale, cap, rate, initialAlisFundBalance, goal,
  setTimingToTokenSaleStart, setTimingToBaseTokenRate,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([owner, wallet]) => {
  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet,
      cap, initialAlisFundBalance, ether(goal), { from: owner });
  });

  describe('creating a valid rate customizable crowdsale', () => {
    it('should initial rate be 20,000 ALIS', async function () {
      const expect = 20000; // pre sale
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('Week1', () => {
    it('should rate of week1 be 2,900 ALIS when just started', async function () {
      await setTimingToTokenSaleStart();

      const expect = 2900;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week1 be 2,900 ALIS when 1 minuit after started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2900;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week1 be 2,900 ALIS when 1 minute before ended', async function () {
      const duration = (60 * 60 * 24 * 7) - 120; // 1 week - 2 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2900;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('Week2', () => {
    it('should rate of week2 be 2,600 ALIS when just started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2600;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week2 be 2,600 ALIS when 1 minuit after started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2600;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week2 be 2,600 ALIS when 1 minute before ended', async function () {
      const duration = (60 * 60 * 24 * 7) - 120; // 1 week - 2 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2600;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('Week3', () => {
    it('should rate of week3 be 2,300 ALIS when just started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2300;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week3 be 2,300 ALIS when 1 minuit after started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2300;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week3 be 2,300 ALIS when few minute before ended', async function () {
      // FIXME: This duration (600 sec) because of time management specification.
      const duration = (60 * 60 * 24 * 7) - 600; // 1 week - 10 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2300;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('base', () => {
    it('should base rate be 2,000 ALIS', async function () {
      await setTimingToBaseTokenRate();

      const expect = 2000; // base
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });
});
