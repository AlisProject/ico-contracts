pragma solidity ^0.4.11;


import 'zeppelin/contracts/token/MintableToken.sol';


contract AlisToken is MintableToken {

  string public name;

  string public symbol;

  uint public decimals;

  address public multisig;

  function AlisToken(
  uint256 _initialAmount,
  string _tokenName,
  uint8 _decimalUnits,
  string _tokenSymbol
  )
  {
    name = _tokenName;
    symbol = _tokenSymbol;
    decimals = _decimalUnits;

    // FIXME
    multisig = 0x0;

    balances[msg.sender] = _initialAmount;
  }
}
