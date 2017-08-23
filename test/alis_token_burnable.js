import alis from '../utilities/alis';
import ether from './helpers/ether';
import EVMThrow from './helpers/EVMThrow';

import { AlisToken, AlisCrowdsale, should, cap, tokenCap, rate, icoStartTime,
  initialAlisFundBalance, goal, whiteList,
} from './helpers/alis_helper';

contract('AlisToken', ([wallet]) => {
  let token;
  const expectedTokenSupply = alis(240000000);

  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber + 10;
    this.endBlock = web3.eth.blockNumber + 20;

    this.crowdsale = await AlisCrowdsale.new(this.startBlock, icoStartTime, this.endBlock,
      rate.base, wallet, ether(cap), alis(tokenCap), initialAlisFundBalance, ether(goal), whiteList);

    token = AlisToken.at(await this.crowdsale.token());
  });

  it('owner should be able to burn tokens', async () => {
    const { logs } = await token.burn(alis(10000000), { from: wallet });

    const balance = await token.balanceOf(wallet);
    balance.should.be.bignumber.equal(expectedTokenSupply);

    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(expectedTokenSupply);

    const event = logs.find(e => e.event === 'Burn');
    should.exist(event);
  });

  it('cannot burn more tokens than your balance', async () => {
    await token.burn(alis(260000000), { from: wallet })
      .should.be.rejectedWith(EVMThrow);
  });
});
