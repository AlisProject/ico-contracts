import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisCrowdsale, icoStartTime, cap, tokenCap, rate, BigNumber,
  initialAlisFundBalance, goal, whiteList, setTimingToBaseTokenRate,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, wallet]) => {
  const lessThanCap = ether(cap).div(5);

  // OfferedValue / base rate = token cap of ether
  // 250,000,000 / 2,000 = 125,000
  const tokenCapOfEther = ether(125000);

  // Token cap of ether - ( Token cap / 100 ) / rate = Threshold of ether
  // 125000 - ((500000000 / 100) / 2000) = 122,500
  const thresholdOfEther = ether(122500);

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

  describe('creating a valid capped crowdsale', () => {
    it('should fail with zero cap', async function () {
      await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
        rate.base, wallet, 0, initialAlisFundBalance, ether(goal), whiteList)
        .should.be.rejectedWith(EVMThrow);
    });

    it('should cap of ETH be 125,000', async function () {
      const expect = ether(125000);
      const crowdSaleTokenCap = await this.crowdsale.cap();
      await crowdSaleTokenCap.toNumber().should.be.bignumber.equal(expect);
    });

    it('should cap of ALIS token be 500 million', async function () {
      const expect = alis(500000000);
      const crowdSaleTokenCap = await this.crowdsale.tokenCap();
      await crowdSaleTokenCap.toNumber().should.be.bignumber.equal(expect);
    });
  });

  describe('accepting payments with cap', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should accept payments within cap', async function () {
      await this.crowdsale.send(ether(cap).minus(lessThanCap)).should.be.fulfilled;
    });

    it('should accept payments just cap', async function () {
      await this.crowdsale.send(ether(cap).minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
      await this.crowdsale.send(ether(cap));
      await this.crowdsale.send(1).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments outside cap', async function () {
      await this.crowdsale.send(ether(cap));

      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: 1, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should reject payments that exceed cap', async function () {
      await this.crowdsale.send(ether(cap).plus(1)).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments that exceed cap', async function () {
      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: ether(cap).plus(1), from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    // bug fix
    it('should not over 500,000,000 ALIS token if just cap', async function () {
      await this.crowdsale.send(ether(cap).minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;

      const totalSupply = await new BigNumber(await this.token.totalSupply());
      const actual = await totalSupply.lessThanOrEqualTo(alis(500000000));

      await actual.should.equal(true);
    });
  });

  describe('accepting payments with token cap', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should accept payments within token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther.minus(lessThanCap)).should.be.fulfilled;
    });

    it('should accept payments just token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments outside token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther);

      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: 1, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should reject payments that exceed token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther.plus(1)).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments that exceed token cap', async function () {
      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: tokenCapOfEther.plus(1), from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should equal 500,000,000 ALIS token if just token cap', async function () {
      await this.crowdsale.send(tokenCapOfEther.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;

      const totalSupply = await new BigNumber(await this.token.totalSupply());
      await totalSupply.should.be.bignumber.equal(alis(500000000));
    });
  });

  describe('ending with cap', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should not be ended if under cap', async function () {
      let hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should be ended if cap reached', async function () {
      await this.crowdsale.send(ether(cap));
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });
  });

  describe('ending with token cap', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should not be ended if under token cap threshold', async function () {
      let hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await this.crowdsale.send(thresholdOfEther.minus(ether(5000)));
      hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should not be ended even if immediately before token cap threshold', async function () {
      await this.crowdsale.send(thresholdOfEther.minus(ether(1)));


      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should be ended if cap reached', async function () {
      await this.crowdsale.send(tokenCapOfEther);
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });
  });
});
