pragma solidity ^0.4.4;

contract AllocationAddressList {

  address[] public allocationAddressList;

  function push(address addr) public {
    allocationAddressList.push(addr);
  }
  
}
