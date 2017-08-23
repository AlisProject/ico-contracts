import moment from 'moment';
import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import increaseTime from './helpers/increaseTime';
import EVMThrow from './helpers/EVMThrow';

import {
  AlisCrowdsale, icoStartTime, cap, tokenCap, rate, initialAlisFundBalance, goal,
  setTimingToTokenSaleStart,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, owner, wallet, whiteListedMember, notWhiteListedMember]) => {
  const whiteList = [whiteListedMember];

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
      rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, ether(goal), whiteList,
      { from: owner });
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
    const someOfEtherAmount = ether(10);

    it('should reject payments if not white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: notWhiteListedMember })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments were rejected in pre sale', async function () {
      await advanceToBlock(this.startBlock - 1);

      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: someOfEtherAmount, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should accept payments if white listed member', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: whiteListedMember })
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
    // 250,000,000 / 2,900 = 86206.896...
    const nearTokenCapOfEther = ether(86206);

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

    it('should accept payments over 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate = ALIS tokens.
      // 25,000 * 2,900 = 86.206...
      const etherAmount = await ether(87);
      await this.crowdsale.buyTokens(investor, { value: etherAmount })
        .should.be.fulfilled;
    });

    it('should accept payments until 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther })
        .should.be.fulfilled;
    });

    it('should reject payments over 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther.add(ether(1)) })
        .should.be.rejectedWith(EVMThrow);
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
    // 250,000,000 / 2,600 = 96153.846...
    const nearTokenCapOfEther = ether(96153);

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

    it('should accept payments over 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate = ALIS tokens.
      // 25,000 * 2,600 = 96.153...
      const etherAmount = await ether(97);
      await this.crowdsale.buyTokens(investor, { value: etherAmount })
        .should.be.fulfilled;
    });

    it('should accept payments until 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther })
        .should.be.fulfilled;
    });

    it('should reject payments over 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther.add(ether(1)) })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should rate of week2 be 2,600 ALIS when few minuit before ended', async function () {
      // FIXME: This duration (600 sec) because of time management specification.
      const duration = (60 * 60 * 24 * 7) - 600; // 1 week - 10 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2600;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('Week3', () => {
    // 250,000,000 / 2,600 = 108695.652...
    const nearTokenCapOfEther = ether(108695);

    it('should rate of week3 be 2,300 ALIS when just started', async function () {
      const duration = 600;
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

    it('should accept payments over 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate = ALIS tokens.
      // 25,000 * 2,300 = 108.695...
      const etherAmount = await ether(109);
      await this.crowdsale.buyTokens(investor, { value: etherAmount })
        .should.be.fulfilled;
    });

    it('should accept payments until 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther })
        .should.be.fulfilled;
    });

    it('should reject payments over 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: nearTokenCapOfEther.add(ether(1)) })
        .should.be.rejectedWith(EVMThrow);
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
    // 250,000,000 / 2,600 = 125000...
    const maxEtherAmount = ether(125000);

    it('should rate of week4 be 2,000 ALIS when just started', async function () {
      const duration = 1200;
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

    it('should accept payments over 250,001 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      // ether * rate = ALIS tokens.
      // 25,000 * 2,000 = 125
      const etherAmount = await ether(126);
      await this.crowdsale.buyTokens(investor, { value: etherAmount })
        .should.be.fulfilled;
    });

    it('should accept payments until 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: maxEtherAmount })
        .should.be.fulfilled;
    });

    it('should reject payments over 250,000,000 ALIS tokens', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.buyTokens(investor, { value: maxEtherAmount.add(ether(1)) })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should rate of week4 be 2,000 ALIS when few minute before ended', async function () {
      // FIXME: This duration (1,200 sec) because of time management specification.
      const duration = (60 * 60 * 24 * 7) - 1800; // 1 week - 30 minute.
      await increaseTime(moment.duration(duration, 'second'));

      const expect = 2000;
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });
});
