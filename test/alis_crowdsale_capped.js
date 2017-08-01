import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

const fs = require('fs');

const crowdsaleParams = JSON.parse(fs.readFileSync('./config/Crowdsale.json', 'utf8'));
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const AlisCrowdsale = artifacts.require('AlisCrowdsale');
const AlisToken = artifacts.require('AlisToken');

contract('AlisCrowdsale', ([wallet]) => {
  // TODO: improve decimal calculation.
  const cap = new BigNumber(crowdsaleParams.cap * (10 ** 18));
  const rate = crowdsaleParams.rate;

  const lessThanCap = cap.div(5);

  describe('creating a valid crowdsale', () => {
    it('should fail with zero cap', async function () {
      await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet, 0).should.be.rejectedWith(EVMThrow);
    });

    it('should total supply of ALIS token be 500 million', async function () {
      const expect = (500000000 * (10 ** 18));
      const tokenCap = await this.crowdsale.cap();
      await tokenCap.toNumber().should.be.equal(expect);
    });
  });

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet, cap);

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  describe('accepting payments', () => {
    beforeEach(async function () {
      await advanceToBlock(this.startBlock - 1);
    });

    it('should accept payments within cap', async function () {
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

  describe('ending', () => {
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

    it('should not be ended if just under cap', async function () {
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
