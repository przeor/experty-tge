pragma solidity ^0.4.4;

import "./Ownable.sol";
import "./AllocationAddressList.sol";
import "./Types.sol";

contract BountyTokenAllocation is Ownable, AllocationAddressList {

  // This contract describes how the bounty tokens are allocated.
  // After a bounty allocation was proposed by a signaturer, another
  // signaturer must accept this allocation. And then it can be sent

  // Total amount of remaining tokens to be distributed
  uint public remainingBountyTokens;

  // Possible split states: Proposed, Approved, Rejected
  // Proposed is the initial state.
  // Both Approved and Rejected are final states.
  // The only possible transitions are:
  // Proposed => Approved
  // Proposed => Rejected


  mapping (address => Types.StructBountyAllocation) public bountyOf;

  address public owner = msg.sender;

  function BountyTokenAllocation(uint _remainingBountyTokens) onlyOwner public {
    remainingBountyTokens = _remainingBountyTokens;
  }



  function proposeBountyTransfer(address _dest, uint _amount) public onlyOwner {
    require(_amount > 0);
    require(_amount <= remainingBountyTokens);
    require(bountyOf[_dest].proposalAddress == 0x0); // we can't overwrite existing proposal

    bountyOf[_dest] = Types.StructBountyAllocation({
      amount: _amount,
      proposalAddress: msg.sender,
      bountyState: Types.BountyState.Proposed
    });
    allocationAddressList.push(_dest);
    remainingBountyTokens = remainingBountyTokens - _amount;
  }

  function approveBountyTransfer(address _dest) public onlyOwner {
    require(bountyOf[_dest].bountyState == Types.BountyState.Proposed);

    bountyOf[_dest].bountyState = Types.BountyState.Approved;
  }

  function rejectBountyTransfer(address _dest) public onlyOwner {
    require(bountyOf[_dest].bountyState == Types.BountyState.Proposed);

    bountyOf[_dest].bountyState = Types.BountyState.Rejected;
    remainingBountyTokens = remainingBountyTokens + bountyOf[_dest].amount;
  }

}
