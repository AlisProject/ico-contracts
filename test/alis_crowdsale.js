import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisFund, AlisCrowdsale, BigNumber, cap, tokenCap, rate, icoStartTime,
  initialAlisFundBalance, should, goal, setTimingToBaseTokenRate, whiteList,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, wallet, purchaser]) => {
  const someOfEtherAmount = ether(42);
  const expectedTokenAmount = new BigNumber(rate.base).mul(someOfEtherAmount);
  const expectedInitialTokenAmount = expectedTokenAmount.add(initialAlisFundBalance);

  before(async () => {
    await setTimingToBaseTokenRate();
  });

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
      rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, ether(goal), whiteList);

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  describe('initialized correctly', () => {
    it('should be correct fund address', async () => {
      const fund = await AlisFund.deployed();
      const cs = await AlisCrowdsale.deployed();
      const expect = await fund.address;
      const actual = await cs.wallet();
      actual.should.be.equal(expect);
    });

    it('should token be instance of AlisToken', async function () {
      this.token.should.be.an.instanceof(AlisToken);
    });

    it('should ALIS fund has 250 million tokens.', async function () {
      const expect = alis(250000000);
      const actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);
    });

    it('should total supply be 250 million tokens.', async function () {
      const expect = alis(250000000);
      const actual = await this.token.totalSupply();
      await actual.should.be.bignumber.equal(expect);
    });

    // offering amount = token cap - total supply.
    it('should offering amount be 250 million tokens.', async function () {
      const expect = alis(250000000);
      const totalSupply = await this.token.totalSupply();
      const crowdSaleCap = await this.crowdsale.tokenCap();
      const actual = crowdSaleCap.sub(totalSupply);
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('token owner', () => {
    it('should be token owner', async function () {
      const owner = await this.token.owner();
      owner.should.equal(this.crowdsale.address);
    });
  });

  describe('accepting payments', () => {
    it('should reject payments before start', async function () {
      await this.crowdsale.send(someOfEtherAmount).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value: someOfEtherAmount })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments were rejected before start', async function () {
      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: someOfEtherAmount, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should accept payments after start', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(someOfEtherAmount).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.send(someOfEtherAmount).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments were rejected after end', async function () {
      await advanceToBlock(this.endBlock);
      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: someOfEtherAmount, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });
  });

  describe('token amount adjustments', () => {
    it('should fund has 250 million tokens even if received ether', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(someOfEtherAmount);
      const expect = alis(250000000);
      const actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);
    });

    // initial + ( received ether * decimals ) = total supply
    // 250,000,000 + ( 10,000 * 2,000 ) = 270,000,000
    it('should total supply be 270.8 million tokens after received 10,000 ether', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(ether(10000));
      const expect = alis(270000000);
      const actual = await this.token.totalSupply();
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('high-level purchase', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.sendTransaction({ value: someOfEtherAmount, from: investor });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(someOfEtherAmount);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(someOfEtherAmount);
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedInitialTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value: someOfEtherAmount, from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should not forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value: someOfEtherAmount, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.should.be.bignumber.equal(pre);
    });
  });

  describe('low-level purchase', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(someOfEtherAmount);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser });
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedInitialTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should not forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value: someOfEtherAmount, from: purchaser });
      const post = web3.eth.getBalance(wallet);
      post.should.be.bignumber.equal(pre);
    });
  });

  describe('ending', () => {
    it('should be ended only after end', async function () {
      let ended = await this.crowdsale.hasEnded();
      ended.should.equal(false);
      await advanceToBlock(this.endBlock + 1);
      ended = await this.crowdsale.hasEnded();
      ended.should.equal(true);
    });
  });
});
