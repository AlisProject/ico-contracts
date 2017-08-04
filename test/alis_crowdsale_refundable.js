import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';
import EVMThrow from './helpers/EVMThrow';

import { AlisCrowdsale, cap, rate, initialAlisFundBalance, goal } from './helpers/alis_helper';

contract('AlisCrowdsale', ([owner, wallet, investor]) => {
  const lessThanGoal = goal.minus(ether(100));

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet,
      cap, initialAlisFundBalance, goal, { from: owner });
  });

  describe('creating a valid refundable crowdsale', () => {
    it('should fail with zero goal', async function () {
      await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet,
        cap, initialAlisFundBalance, goal);
    });
  });

  describe('deny refunds', () => {
    it('should deny refunds before end', async function () {
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMThrow);
      await advanceToBlock(this.endBlock - 1);
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMThrow);
    });

    it('should deny refunds after end if goal was reached', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: goal, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMThrow);
    });
  });

  describe('allow refunds', () => {
    it('should allow refunds after end if goal was not reached', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
      await advanceToBlock(this.endBlock);
      await this.crowdsale.finalize({ from: owner });

      const pre = web3.eth.getBalance(investor);
      // TODO: gasPrice
      await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
        .should.be.fulfilled;
      const post = web3.eth.getBalance(investor);

      post.minus(pre).should.be.bignumber.equal(lessThanGoal);
    });
  });

  describe('goal was reached', () => {
    it('should forward funds to wallet after end', async function () {
      await advanceToBlock(this.startBlock - 1);
      await this.crowdsale.sendTransaction({ value: goal, from: investor });
      await advanceToBlock(this.endBlock);

      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.finalize({ from: owner });
      const post = web3.eth.getBalance(wallet);

      post.minus(pre).should.be.bignumber.equal(goal);
    });
  });
});
