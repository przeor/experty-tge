pragma solidity ^0.4.4;

contract AllocationAddressList {

  address[] public allocationAddressList;

  function getAllocationLength() public view returns (uint) {
    return allocationAddressList.length;
  }
}
