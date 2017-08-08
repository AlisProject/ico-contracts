import ether from './helpers/ether';
import advanceToBlock from './helpers/advanceToBlock';

import { AlisCrowdsale, cap, rate, initialAlisFundBalance, goal,
  setTimingToBaseTokenRate } from './helpers/alis_helper';

contract('AlisCrowdsale', ([owner, wallet]) => {
  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, this.endBlock, rate, wallet,
      cap, initialAlisFundBalance, ether(goal), { from: owner });
  });

  describe('creating a valid rate customizable crowdsale', () => {
    it('should initial rate be 20,000 ALIS', async function () {
      const expect = 20000; // pre sale
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });

    it('should base rate be 2,000 ALIS', async function () {
      await setTimingToBaseTokenRate();

      const expect = 2000; // base
      await advanceToBlock(this.endBlock - 1);
      const actual = await this.crowdsale.getRate();
      await actual.should.be.bignumber.equal(expect);
    });
  });
});
