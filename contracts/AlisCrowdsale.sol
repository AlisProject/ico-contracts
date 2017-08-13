pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './AlisToken.sol';


/**
 * The Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale, RefundableCrowdsale {

  uint256 constant WEEK = 600;

  /*
  * Token exchange rates of ETH and ALIS.
  */
  uint256 public ratePreSale;
  uint256 public rateWeek1;
  uint256 public rateWeek2;
  uint256 public rateWeek3;

  function AlisCrowdsale(
  uint256 _startBlock,
  uint256 _endBlock,
  uint256 _baseRate,
  address _wallet,
  uint256 _cap,
  uint256 _initialAlisFundBalance,
  uint256 _goal,
  uint256 _ratePreSale,
  uint256 _rateWeek1,
  uint256 _rateWeek2,
  uint256 _rateWeek3
  )
  Crowdsale(_startBlock, _endBlock, _baseRate, _wallet)
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  {
    ratePreSale = _ratePreSale;
    rateWeek1 = _rateWeek1;
    rateWeek2 = _rateWeek2;
    rateWeek3 = _rateWeek3;

    token.mint(wallet, _initialAlisFundBalance);
  }

  // overriding Crowdsale#createTokenContract to change token to AlisToken.
  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }

  // overriding RefundableCrowdsale#finalization to store remaining tokens.
  function finalization() internal {
    uint256 remaining = cap.sub(token.totalSupply());

    if (remaining > 0) {
      token.mint(wallet, remaining);
    }

    super.finalization();
  }

  // overriding Crowdsale#buyTokens to rate customizable.
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(getRate());

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // Custom rate.
  //
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function getRate() constant returns (uint256) {
    uint256 currentRate = rate;

    // TODO: refactoring
    uint256 tokenSaleStartTimeStamp = 1504231200;

    if (now <= tokenSaleStartTimeStamp) {
      currentRate = ratePreSale;
    } else if (now <= tokenSaleStartTimeStamp.add(WEEK)) {
      currentRate = rateWeek1;
    } else if (now <= tokenSaleStartTimeStamp.add(WEEK.mul(2))) {
      currentRate = rateWeek2;
    } else if (now <= tokenSaleStartTimeStamp.add(WEEK.mul(3))) {
      currentRate = rateWeek3;
    }

    return currentRate;
  }
}
