pragma solidity ^0.4.11;


import "tokens/HumanStandardToken.sol";


contract AlisToken is HumanStandardToken {

  uint256 public offeredAmount; // Amount of AlisTokens offered to the public.

  function AlisToken(
  uint256 _initialAmount,
  string _tokenName,
  uint8 _decimalUnits,
  string _tokenSymbol,
  uint256 _offeredAmount
  )
  HumanStandardToken(_initialAmount, _tokenName, _decimalUnits, _tokenSymbol)
  {
    offeredAmount = _offeredAmount;
  }
}
