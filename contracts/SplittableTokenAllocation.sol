pragma solidity ^0.4.4;


contract SplittableTokenAllocation {

  struct SplitT {
    address source;
    address dest;
    uint tokens;
    bool isApproved;
    bool isExecuted;
  }

  uint public exyPerPeriod;
  uint public periods;
  uint public months;

  SplitT[] public splits;

  function SplittableTokenAllocation(uint _exyPerPeriod, uint _periods, uint _months) {
    exyPerPeriod = _exyPerPeriod;
    periods = _periods;
    months = _months;
  }

  function proposeSplit(address splitPool, address dest, uint tokens) public returns(uint) {
    splits.push(SplitT({
      source: splitPool,
      dest: dest,
      tokens: tokens,
      isApproved: false,
      isExecuted: false
    }));
  }

  function getLastSplitId() public view returns (uint) {
    return splits.length - 1;
  }

  function approveSplit(uint splitId) public {
    splits[splitId].isApproved = true;
  }

}
