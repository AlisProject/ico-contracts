import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisCrowdsale, cap, rate, BigNumber,
  initialAlisFundBalance, goal, whiteList, setTimingToBaseTokenRate,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([investor, wallet]) => {
  const lessThanCap = cap.div(5);

  before(async () => {
    await setTimingToBaseTokenRate();
  });

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock,
      rate.base, wallet, cap, initialAlisFundBalance, ether(goal),
      rate.preSale, rate.week1, rate.week2, rate.week3, whiteList);

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  describe('creating a valid capped crowdsale', () => {
    it('should fail with zero cap', async function () {
      await AlisCrowdsale.new(this.startBlock, this.endBlock,
        rate.base, wallet, 0, initialAlisFundBalance, ether(goal),
        rate.preSale, rate.week1, rate.week2, rate.week3, whiteList)
        .should.be.rejectedWith(EVMThrow);
    });

    it('should cap of ALIS token be 500 million', async function () {
      const expect = alis(500000000);
      const tokenCap = await this.crowdsale.cap();
      await tokenCap.toNumber().should.be.bignumber.equal(expect);
    });
  });

  describe('accepting payments with cap', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should accept payments within cap', async function () {
      await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
    });

    it('should accept payments just cap', async function () {
      await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
      await this.crowdsale.send(cap);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments outside cap', async function () {
      await this.crowdsale.send(cap);

      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: 1, from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    it('should reject payments that exceed cap', async function () {
      await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMThrow);
    });

    it('should not lose ETH if payments that exceed cap', async function () {
      const beforeSend = web3.eth.getBalance(investor);
      await this.crowdsale.sendTransaction(
        { value: cap.plus(1), from: investor, gasPrice: 0 })
        .should.be.rejectedWith(EVMThrow);

      const afterRejected = web3.eth.getBalance(investor);
      await afterRejected.should.be.bignumber.equal(beforeSend);
    });

    // bug fix
    it('should not over 500,000,000 ALIS token if just cap', async function () {
      await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;

      const totalSupply = await new BigNumber(await this.token.totalSupply());
      const actual = await totalSupply.lessThanOrEqualTo(alis(500000000));

      await actual.should.equal(true);
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

    it('should not be ended even if immediately before cap', async function () {
      await this.crowdsale.send(cap.minus(1));
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should be ended if cap reached', async function () {
      await this.crowdsale.send(cap);
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });
  });
});
