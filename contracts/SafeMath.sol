pragma solidity ^0.4.11;

/**
 * Math operations with safety checks
 */
library SafeMath {
  function sub(uint a, uint b) pure internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function add(uint a, uint b) pure internal returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
  function min(uint a, uint b) pure internal returns (uint) {
    if(a > b)
      return b;
    else
      return a;
  }
}
