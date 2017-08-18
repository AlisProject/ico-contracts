pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './WhitelistedCrowdsale.sol';
import './AlisToken.sol';


/**
 * The Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale, RefundableCrowdsale, WhitelistedCrowdsale {

  // ICO start date time 2017 Sep 1 2:00(UTC)
  // Could not add to AlisCrowdsale.json because of EVM said stack too deep.
  uint256 constant ICO_START_TIME = 1504231200;

  // Seconds of one week. (60 * 60 * 24 * 7) = 604,800
  uint256 constant WEEK = 604800;

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
  uint256 _rateWeek3,
  address[] _whiteList
  )
  Crowdsale(_startBlock, _endBlock, _baseRate, _wallet)
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  WhitelistedCrowdsale(_whiteList)
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

  // overriding RefundableCrowdsale#finalization
  // - To store remaining tokens.
  // - To minting unfinished because of our consensus algorithm.
  //   - https://alisproject.github.io/whitepaper/whitepaper_v1.01.pdf
  function finalization() internal {
    uint256 remaining = cap.sub(token.totalSupply());

    if (remaining > 0) {
      token.mint(wallet, remaining);
    }

    // change AlisToken owner to AlisFund.
    token.transferOwnership(wallet);

    // From RefundableCrowdsale#finalization
    if (goalReached()) {
      vault.close();
    } else {
      vault.enableRefunds();
    }
  }

  // overriding Crowdsale#buyTokens to rate customizable.
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(validPurchase());
    require(saleAccepting());

    uint256 weiAmount = msg.value;

    // for presale
    if ( isPresale() ) {
      checkLimit(weiAmount);
    }

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

    if (now <= ICO_START_TIME) {
      // before 2017/09/01 02:00 UTC
      currentRate = ratePreSale;
    } else if (now <= ICO_START_TIME.add(WEEK)) {
      // before 2017/09/08 02:00 UTC
      currentRate = rateWeek1;
    } else if (now <= ICO_START_TIME.add(WEEK.mul(2))) {
      // before 2017/09/15 02:00 UTC
      currentRate = rateWeek2;
    } else if (now <= ICO_START_TIME.add(WEEK.mul(3))) {
      // before 2017/09/21 02:00 UTC
      currentRate = rateWeek3;
    }

    return currentRate;
  }

  // @return true if crowd sale is accepting.
  function saleAccepting() internal constant returns (bool) {
    return !isPresale() || isWhiteListMember(msg.sender);
  }

  // @return true if crowd sale is pre sale.
  function isPresale() internal constant returns (bool) {
    return now <= ICO_START_TIME;
  }
}
