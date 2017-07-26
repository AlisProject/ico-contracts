pragma solidity ^0.4.11;


import "tokens/HumanStandardToken.sol";
import "zeppelin/contracts/ownership/Ownable.sol";


contract AlisToken is HumanStandardToken, Ownable {

  function AlisToken(
  uint256 _initialAmount,
  string _tokenName,
  uint8 _decimalUnits,
  string _tokenSymbol
  )
  HumanStandardToken(_initialAmount, _tokenName, _decimalUnits, _tokenSymbol)
  {
  }
}
