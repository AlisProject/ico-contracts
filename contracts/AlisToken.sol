pragma solidity ^0.4.13;


import 'zeppelin/contracts/token/MintableToken.sol';


contract AlisToken is MintableToken {

  string public constant name = 'Jabberwock';

  string public constant symbol = 'ATT3';

  // same as ether. (1ether=1wei * (10 ** 18))
  uint public constant decimals = 18;
}
