pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './AlisToken.sol';


/**
 * The Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale, RefundableCrowdsale {

  function AlisCrowdsale(
  uint256 _startBlock,
  uint256 _endBlock,
  uint256 _rate,
  address _wallet,
  uint256 _cap,
  uint256 _initialAlisFundBalance,
  uint256 _goal
  )
  Crowdsale(_startBlock, _endBlock, _rate, _wallet)
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  {
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
  // TODO: refactoring
  //
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function getRate() constant returns (uint256) {
    uint256 currentRate = rate;

    uint256 tokenSaleStartTimeStamp = 1504231200;
    uint256 week = 604800; // 60 * 60 * 24 * 7

    if (now <= tokenSaleStartTimeStamp) {
      // before 2017/09/01 02:00 UTC
      currentRate = 20000;
    } else if (now <= tokenSaleStartTimeStamp.add(week)) {
      // before 2017/09/08 02:00 UTC
      currentRate = 2900;
    } else if (now <= tokenSaleStartTimeStamp.add(week * 2)) {
      // before 2017/09/15 02:00 UTC
      currentRate = 2600;
    } else if (now <= tokenSaleStartTimeStamp.add(week * 3)) {
      // before 2017/09/21 02:00 UTC
      currentRate = 2300;
    }

    return currentRate;
  }
}
