pragma solidity ^0.4.4;


contract Signatures {
  mapping (address => bool) public exist;

  /**
   * Multisig contructor. Creates exist map with addresses of
   * founders wallets. For each action we will need 2 out of 3 signatures
   *
   * @param _account0 - The address of first signaturer.
   * @param _account1 - The address of senod signaturer.
   * @param _account2 - The address of third signaturer.
   */
  function Signatures(address _account0, address _account1, address _account2) public {
    exist[_account0] = true;
    exist[_account1] = true;
    exist[_account2] = true;
  }

}