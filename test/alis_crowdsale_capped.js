import alis from '../utilities/alis';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisCrowdsale, cap, rate,
  initialAlisFundBalance } from './helpers/alis_crowdsale_helper';

contract('AlisCrowdsale', ([wallet]) => {
  const lessThanCap = cap.div(5);

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet,
      cap, initialAlisFundBalance);

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  describe('creating a valid capped crowdsale', () => {
    it('should fail with zero cap', async function () {
      await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet, 0,
        initialAlisFundBalance).should.be.rejectedWith(EVMThrow);
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

    it('should reject payments that exceed cap', async function () {
      await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMThrow);
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
