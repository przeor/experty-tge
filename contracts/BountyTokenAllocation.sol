pragma solidity ^0.4.4;

import "./Ownable.sol";
import "./AllocationAddressList.sol";
import "./SplitTypes.sol";

contract BountyTokenAllocation is Ownable, AllocationAddressList {

  // This contract describes how the bounty tokens are allocated.
  // After a bounty allocation was proposed by a signaturer, another
  // signaturer must accept this allocation.

  // Total amount of remaining tokens to be distributed
  uint public remainingBountyTokens;

  // Possible split states: Proposed, Approved, Rejected
  // Proposed is the initial state.
  // Both Approved and Rejected are final states.
  // The only possible transitions are:
  // Proposed => Approved
  // Proposed => Rejected


  mapping (address => SplitTypes.BountyAllocationT) public bountyOf;

  address public owner = msg.sender;

  /**
   * Bounty token allocation constructor.
   *
   * @param _remainingBountyTokens Total number of bounty tokens that will be
   *                               allocated.
   */
  function BountyTokenAllocation(uint _remainingBountyTokens) onlyOwner public {
    remainingBountyTokens = _remainingBountyTokens;
  }

  /**
   * Propose a bounty transfer
   *
   * @param _dest Address of bounty reciepent
   * @param _amount Amount of tokens he will receive
   */
  function proposeBountyTransfer(address _dest, uint _amount) public onlyOwner {
    require(_amount > 0);
    require(_amount <= remainingBountyTokens);
    require(bountyOf[_dest].proposalAddress == 0x0); // we can't overwrite existing proposal

    bountyOf[_dest] = SplitTypes.BountyAllocationT({
      amount: _amount,
      proposalAddress: msg.sender,
      bountyState: SplitTypes.BountyState.Proposed
    });
    allocationAddressList.push(_dest);
    remainingBountyTokens = remainingBountyTokens - _amount;
  }

  /**
   * Approves a bounty transfer
   *
   * @param _dest Address of bounty reciepent
   * @return amount of tokens which we approved
   */
  function approveBountyTransfer(address _dest) public onlyOwner returns (uint) {
    require(bountyOf[_dest].bountyState == SplitTypes.BountyState.Proposed);

    bountyOf[_dest].bountyState = SplitTypes.BountyState.Approved;
    return bountyOf[_dest].amount;
  }

  /**
   * Rejects a bounty transfer
   *
   * @param _dest Address of bounty reciepent for whom we are rejecting bounty transfer
   */
  function rejectBountyTransfer(address _dest) public onlyOwner {
    require(bountyOf[_dest].bountyState == SplitTypes.BountyState.Proposed);

    bountyOf[_dest].bountyState = SplitTypes.BountyState.Rejected;
    remainingBountyTokens = remainingBountyTokens + bountyOf[_dest].amount;
  }

}
