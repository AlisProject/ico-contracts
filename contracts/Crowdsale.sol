pragma solidity ^0.4.11;


import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract Crowdsale {

  AlisToken public token;  // ALIS Token contract.
  address public fund; // The fund of ALIS project.

  function Crowdsale(address _AlisTokenAddress, address _fundAddress){
    token = AlisToken(_AlisTokenAddress);
    fund = _fundAddress;
  }
}
