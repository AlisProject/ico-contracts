import alis from '../utilities/alis';
import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import {
  AlisCrowdsale, icoStartTime, cap, tokenCap, rate, initialAlisFundBalance,
  goal, BigNumber, setTimingToBaseTokenRate, whiteList,
} from './helpers/alis_helper';

contract('AlisCrowdsale', ([owner, wallet, investor, notInvestor]) => {
  const lessThanGoal = ether(goal).minus(ether(100));

  before(async () => {
    await setTimingToBaseTokenRate();
  });

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
      rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, ether(goal), whiteList, { from: owner });
  });

  describe('creating a valid refundable crowdsale', () => {
    it('should fail with zero goal', async function () {
      await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
        rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, 0,
        whiteList, { from: owner })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should goal be 11,666 ETH', async function () {
      const expect = ether(11666);
      const actual = await this.crowdsale.goal();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should goal be 350,000,000 JPY', async () => {
      const goalAsJPY = new BigNumber(349980000); // 約3.5億円
      const expectedEtherPrice = new BigNumber(30000); // 3万円
      const convertedGoal = expectedEtherPrice.times(goal);
      await goalAsJPY.should.be.bignumber.equal(convertedGoal);
    });

    it('should has enough ALIS token to reach the goal', async function () {
      let hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: ether(goal), from: investor });
      hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    // bug fix
    // https://github.com/AlisProject/contracts/pull/14
    it('should goal unit be wei(not ether)', async () => {
      const target = await AlisCrowdsale.deployed();
      const actual = await target.goal();
      actual.should.be.bignumber.equal(ether(goal));
    });
  });

  describe('deny refunds', () => {
    it('should deny refunds before end', async function () {
      await this.crowdsale.claimRefund({ from: investor })
        .should.be.rejectedWith(EVMThrow);
      await advanceToBlock(this.endBlock - 1);
      await this.crowdsale.claimRefund({ from: investor })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should deny refunds after end if goal was reached', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: ether(goal), from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });
      await this.crowdsale.claimRefund({ from: investor })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should deny refunds after end if goal was exceeded', async function () {
      await advanceToBlock(this.startBlock - 1);
      const exceeded = ether(goal).plus(ether(100));
      await this.crowdsale.sendTransaction({ value: exceeded, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });
      await this.crowdsale.claimRefund({ from: investor })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should deny refunds if cap was reached', async function () {
      await advanceToBlock(this.startBlock - 1);

      // offered amount / base rate = cap reaching amount
      // 250000000 / 2000 = 125000
      const capReachingAmount = await ether(125000);
      await this.crowdsale.sendTransaction({ value: capReachingAmount, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      await this.crowdsale.claimRefund({ from: investor })
        .should.be.rejectedWith(EVMThrow);
    });

    it('should goalReached() be true', async function () {
      await advanceToBlock(this.startBlock - 1);
      const exceeded = ether(goal).plus(ether(100));
      await this.crowdsale.sendTransaction({ value: exceeded, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const actual = await this.crowdsale.goalReached();

      await actual.should.equal(true);
    });
  });

  describe('allow refunds', () => {
    it('should allow refunds after end if goal was not reached', async function () {
      const beforeSend = web3.eth.getBalance(investor);

      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction(
        { value: lessThanGoal, from: investor, gasPrice: 0 });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const sent = web3.eth.getBalance(investor);
      await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
        .should.be.fulfilled;
      const afterClaim = web3.eth.getBalance(investor);

      await beforeSend.should.be.bignumber.equal(afterClaim);
      await afterClaim.minus(sent).should.be.bignumber.equal(lessThanGoal);
    });

    it('should allow refunds after end if goal was only 1 ether missing', async function () {
      await advanceToBlock(this.startBlock - 1);
      const onlyOneEtherMissing = ether(goal).minus(ether(1));
      await this.crowdsale.sendTransaction({ value: onlyOneEtherMissing, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const pre = web3.eth.getBalance(investor);
      await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
        .should.be.fulfilled;
      const post = web3.eth.getBalance(investor);

      post.minus(pre).should.be.bignumber.equal(onlyOneEtherMissing);
    });

    it('should return 0 ether to non investors', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const pre = web3.eth.getBalance(notInvestor);
      await this.crowdsale.claimRefund({ from: notInvestor, gasPrice: 0 })
        .should.be.fulfilled;
      const post = web3.eth.getBalance(notInvestor);

      post.should.be.bignumber.equal(pre);
    });

    it('should goalReached() be false', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const actual = await this.crowdsale.goalReached();

      actual.should.equal(false);
    });
  });

  describe('goal was reached', () => {
    it('should forward funds to wallet after end', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: ether(goal), from: investor });
      await advanceToBlock(this.endBlock);

      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.finalize({ from: owner });
      const post = web3.eth.getBalance(wallet);

      post.minus(pre).should.be.bignumber.equal(ether(goal));
    });
  });
});
