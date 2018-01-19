pragma solidity ^0.4.4;


contract Multisig {

  mapping (address => bool) public isSignatory;

  function Multisig(address account0, address account1, address account2) {
    isSignatory[account0] = true;
    isSignatory[account1] = true;
    isSignatory[account2] = true;
  }

}
