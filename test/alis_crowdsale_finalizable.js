import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisCrowdsale, icoStartTime, cap, tokenCap, rate,
  initialAlisFundBalance, goal, should, setTimingToBaseTokenRate, whiteList,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([owner, wallet, thirdparty]) => {
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
      rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, ether(goal), whiteList, { from: owner });

    this.token = AlisToken.at(await this.crowdsale.token());
  });

  describe('finalize', () => {
    it('can be finalized by owner after ending', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
    });

    it('can be finalized when token cap reached 99%', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(thresholdOfEther);
      await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
    });

    it('can be finalized when token cap over 99%', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(thresholdOfEther.plus(1));
      await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
    });

    it('can be finalized when just token cap reached', async function () {
      // OfferedValue / base rate = token cap of ether
      // 250,000,000 / 2,000 = 125,000
      const tokenCapOfEther = ether(125000);

      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(tokenCapOfEther);
      await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
    });

    it('logs finalized', async function () {
      await advanceToBlock(this.endBlock);
      const { logs } = await this.crowdsale.finalize({ from: owner });
      const event = logs.find(e => e.event === 'Finalized');
      should.exist(event);
    });

    it('do not finishes minting of token', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });
      const finished = await this.token.mintingFinished();
      finished.should.equal(false);
    });

    it('should change owner of AlisToken to AlisFund', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });
      const actual = await this.token.owner();
      actual.should.equal(wallet);
    });
  });

  describe('remaining tokens', () => {
    it('should store to ALIS fund if tokens are remain', async function () {
      await advanceToBlock(this.startBlock - 1);

      // ether * rate = sold amount
      // 100,000 * 2,000 = 200,000,000
      await this.crowdsale.send(ether(100000));

      // offered amount - sold amount = remain
      // 250,000,000 - 200,000,000 = 50,000,000
      const remainingTokens = alis(50000000);

      let expect = alis(250000000);
      let actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);

      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      expect = expect.plus(remainingTokens);
      actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);
    });

    it('should not care about goal, to keep code simple', async function () {
      let expect = alis(250000000);
      let actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);

      const goalReached = await this.crowdsale.goalReached();
      await goalReached.should.equal(false);

      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      expect = alis(500000000);
      actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);
    });

    it('should goalReached() be false even if mint remaining tokens', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      // goalReached() does not care about minted ALIS token amount because it depends weiRaised.
      const goalReached = await this.crowdsale.goalReached();
      await goalReached.should.equal(false);
    });

    it('should not do anything if no remaining token', async function () {
      // No remaining token already.
      const capSameAsInitialAlisFundBalance = initialAlisFundBalance;
      this.crowdsale = await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
        rate.base, wallet, capSameAsInitialAlisFundBalance, alis(tokenCap), initialAlisFundBalance,
        ether(goal), whiteList, { from: owner });

      this.token = AlisToken.at(await this.crowdsale.token());

      const expect = alis(250000000);
      let actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);

      await advanceToBlock(this.startBlock - 1);

      // cap reached.
      // ether * rate = sold amount
      // 125,000 * 2,000 = 250,000,000
      await this.crowdsale.send(ether(125000));

      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      // Same balance of before finalize.
      actual = await this.token.balanceOf(wallet);
      await actual.should.be.bignumber.equal(expect);
    });
  });

  describe('reject finalize', () => {
    it('cannot be finalized before ending', async function () {
      await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMThrow);
    });

    it('can not be finalized when token cap is not reached 99%', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.send(thresholdOfEther.minus(1));
      await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMThrow);
    });

    it('cannot be finalized by third party after ending', async function () {
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: thirdparty }).should.be.rejectedWith(EVMThrow);
    });

    it('cannot be finalized twice', async function () {
      await advanceToBlock(this.endBlock + 1);
      await this.crowdsale.finalize({ from: owner });
      await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMThrow);
    });
  });
});
