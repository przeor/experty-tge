pragma solidity ^0.4.4;

import "./Ownable.sol";
import "./AllocationAddressList.sol";

contract BountyTokenAllocation is Ownable, AllocationAddressList {

  // This contract describes how the bounty tokens are allocated.
  // After a bounty allocation was proposed by a signaturer, another
  // signaturer must accept this allocation. And then it can be sent

  // Total amount of remaining tokens to be distributed
  int public remainingBountyTokens;

  // Possible split states: Proposed, Approved, Rejected
  // Proposed is the initial state.
  // Both Approved and Rejected are final states.
  // The only possible transitions are:
  // Proposed => Approved
  // Proposed => Rejected
  enum BountyState {
    Proposed, // 0
    Approved, // 1
    Rejected  // 2
  }

  mapping (address => BountyAllocationT) public bountyOf;

  address public owner = msg.sender;

  AllocationAddressList private allocationAddressList;

  function BountyTokenAllocation(int _remainingBountyTokens) onlyOwner public {
    remainingBountyTokens = _remainingBountyTokens;
    allocationAddressList = new AllocationAddressList();
  }

  struct BountyAllocationT {
    // How many tokens send him or her
    int amount;
    // By whom was this allocation proposed
    address proposalAddress;
    // State of actual split.
    BountyState bountyState;
  }

  function proposeBountyTransfer(address _dest, int _amount) public onlyOwner {
    require(_amount > 0);
    require(_amount <= remainingBountyTokens);
    require(bountyOf[_dest].proposalAddress == 0x0); // we can't overwrite existing proposal

    bountyOf[_dest] = BountyAllocationT({
      amount: _amount,
      proposalAddress: msg.sender,
      bountyState: BountyState.Proposed
    });
    remainingBountyTokens = remainingBountyTokens - _amount;
  }

  function approveBountyTransfer(address _dest) public onlyOwner {
    require(bountyOf[_dest].bountyState == BountyState.Proposed);

    bountyOf[_dest].bountyState = BountyState.Approved;
    allocationAddressList.push(_dest);
  }

  function rejectBountyTransfer(address _dest) public onlyOwner {
    require(bountyOf[_dest].bountyState == BountyState.Proposed);

    bountyOf[_dest].bountyState = BountyState.Rejected;
    remainingBountyTokens = remainingBountyTokens + bountyOf[_dest].amount;
  }

}
