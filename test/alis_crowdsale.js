import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

const AlisToken = artifacts.require('AlisToken.sol');
const Crowdsale = artifacts.require('AlisCrowdsale.sol');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('AlisCrowdsale', ([investor, wallet, purchaser]) => {
  // TODO: improve decimal calculation.
  const cap = new BigNumber(500000000 * (10 ** 18));

  const rate = new BigNumber(1000);
  const value = ether(42);

  const expectedTokenAmount = rate.mul(value);

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await Crowdsale.new(this.startBlock, this.endBlock, rate, wallet, cap);

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded();
    ended.should.equal(false);
    await advanceToBlock(this.endBlock + 1);
    ended = await this.crowdsale.hasEnded();
    ended.should.equal(true);
  });

  describe('accepting payments', () => {
    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value }).should.be.rejectedWith(EVMThrow);
    });

    it('should accept payments after start', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow);
      await this.crowdsale.buyTokens(investor, { value, from: purchaser }).should.be.rejectedWith(EVMThrow);
    });
  });

  describe('high-level purchase', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.sendTransaction({ value, from: investor });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(value);
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value, from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.buyTokens(investor, { value, from: purchaser });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });
});
