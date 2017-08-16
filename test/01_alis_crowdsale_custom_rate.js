import moment from 'moment';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import increaseTime from './helpers/increaseTime';
import EVMThrow from './helpers/EVMThrow';

import {
  AlisCrowdsale, cap, rate, initialAlisFundBalance, goal,
  setTimingToTokenSaleStart,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, owner, wallet, purchaser, whiteListedMember, notWhiteListedMember]) => {
  const whiteList = [whiteListedMember];

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock,
      rate.base, wallet, cap, initialAlisFundBalance, ether(goal),
      rate.preSale, rate.week1, rate.week2, rate.week3, whiteList, { from: owner });
  });

  describe('creating a valid rate customizable crowdsale', () => {
    it('should initial rate be 20,000 ALIS for pre sale', async function () {
      const expect = 20000; // pre sale
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('Pre sale', () => {
    const someOfTokenAmount = ether(42);

    it('should reject payments if not white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfTokenAmount, from: notWhiteListedMember })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should accept payments if white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfTokenAmount, from: whiteListedMember })
        .should.be.fulfilled;
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

    it('should rate of week2 be 2,600 ALIS when 1 minuit before ended', async function () {
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

  describe('From week4 to until the end of token sale', () => {
    it('should rate of week4 be 2,000 ALIS when just started', async function () {
      const duration = 600;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2000;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week4 be 2,000 ALIS when few minute after started', async function () {
      const duration = 60;
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2000;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should rate of week4 be 2,000 ALIS when few minute before ended', async function () {
      // FIXME: This duration (1,200 sec) because of time management specification.
      const duration = (60 * 60 * 24 * 7) - 1200; // 1 week - 20 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2000;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });
});
