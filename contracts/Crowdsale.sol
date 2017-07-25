pragma solidity ^0.4.11;


import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract Crowdsale {

  AlisToken public token;  // ALIS Token contract.
  address public fund; // The fund of ALIS project.
  uint public rate; // Rate of ETH to ALIS.

  function Crowdsale(address _AlisTokenAddress, address _fundAddress, uint _rate){
    token = AlisToken(_AlisTokenAddress);
    fund = _fundAddress;
    rate = _rate;
  }
}
