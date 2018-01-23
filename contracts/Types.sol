pragma solidity ^0.4.11;

contract Types {

  // Possible split states: Proposed, Approved, Rejected
  // Proposed is the initial state.
  // Both Approved and Rejected are final states.
  // The only possible transitions are:
  // Proposed => Approved
  // Proposed => Rejected
  enum AllocationState {
    Proposed,
    Approved,
    Rejected
  }

  // Structure used for storing company and partner allocations
  struct StructVestingAllocation {
    // How many tokens per period we want to pass
    uint tokensPerPeriod;
    // By whom was this split proposed. Another signaturer must approve too
    address proposerAddress;
    // How many times did we released tokens
    uint claimedPeriods;
    // State of actual split.
    AllocationState allocationState;
  }

   enum BountyState {
    Proposed, // 0
    Approved, // 1
    Rejected  // 2
  }

  struct StructBountyAllocation {
    // How many tokens send him or her
    uint amount;
    // By whom was this allocation proposed
    address proposalAddress;
    // State of actual split.
    BountyState bountyState;
  }
}