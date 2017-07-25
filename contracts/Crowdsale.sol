pragma solidity ^0.4.11;


import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract Crowdsale {

  AlisToken public token;  // ALIS Token contract.
  address public fund; // The fund of ALIS project.
  uint256 public offeredAmount; // Amount of AlisTokens offered to the public.
  uint public rate; // Rate of ETH to ALIS.

  function Crowdsale(address _AlisTokenAddress, address _fundAddress, uint256 _offeredAmount, uint _rate){
    token = AlisToken(_AlisTokenAddress);
    fund = _fundAddress;
    offeredAmount = _offeredAmount;
    rate = _rate;
  }
}
