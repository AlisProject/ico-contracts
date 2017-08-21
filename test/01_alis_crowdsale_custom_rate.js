import moment from 'moment';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import increaseTime from './helpers/increaseTime';
import EVMThrow from './helpers/EVMThrow';

import {
  AlisCrowdsale, cap, rate, initialAlisFundBalance, goal,
  setTimingToTokenSaleStart,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, owner, wallet, whiteListedMember, notWhiteListedMember]) => {
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
    const someOfTokenAmount = ether(10);

    it('should reject payments if not white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfTokenAmount, from: notWhiteListedMember })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments were rejected in pre sale', async function () {
      await advanceToBlock(this.startBlock - 1);

      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: someOfTokenAmount, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should accept payments if white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfTokenAmount, from: whiteListedMember })
        .should.be.fulfilled;
    });

    it('should accept payments 249,999 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate of pre sale = ALIS tokens.
      // 12.49995 * 20,000 = 249,999
      const etherAmount = await ether(12.49995);
      await this.crowdsale.buyTokens(investor, { value: etherAmount, from: whiteListedMember })
        .should.be.fulfilled;
    });

    it('should accept payments 250,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate of pre sale = ALIS tokens.
      // 12.5 * 20,000 = 250,000
      const etherAmount = await ether(12.5);
      await this.crowdsale.buyTokens(investor, { value: etherAmount, from: whiteListedMember })
        .should.be.fulfilled;
    });

    it('should reject payments 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate of pre sale = ALIS tokens.
      // 12.50005 * 20,000 = 250,001
      const etherAmount = await ether(12.50005);
      await this.crowdsale.buyTokens(investor, { value: etherAmount, from: whiteListedMember })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      const beforeSend = web3.eth.getBalance(whiteListedMember);

      // ether * rate of pre sale = ALIS tokens.
      // 12.50005 * 20,000 = 250,001
      const etherAmount = await ether(12.50005);
      await this.crowdsale.buyTokens(investor, { value: etherAmount, from: whiteListedMember, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(whiteListedMember);
      await afterRejected.should.be.bignumber.equal(beforeSend);
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

    it('should accept payments 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate of pre sale = ALIS tokens.
      // 12.50005 * 20,000 = 250,001
      const etherAmount = await ether(12.50005);
      await this.crowdsale.buyTokens(investor, { value: etherAmount, from: whiteListedMember })
        .should.be.fulfilled;
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
