pragma solidity ^0.4.11;


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
}
