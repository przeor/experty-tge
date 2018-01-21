pragma solidity ^0.4.4;

contract AllocationAddressList {

  address[] public allocationAddressList;

  function push(address addr) public {
    allocationAddressList.push(addr);
  }

  function getLength() public returns (uint){
    return allocationAddressList.length;
  }

  function getAddress(uint id) public returns (address){
    return allocationAddressList[id];
  }

}
