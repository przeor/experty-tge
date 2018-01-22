pragma solidity ^0.4.11;

contract SplitTypes {

  // Possible split states: Proposed, Approved, Rejected
  // Proposed is the initial state.
  // Both Approved and Rejected are final states.
  // The only possible transitions are:
  // Proposed => Approved
  // Proposed => Rejected
  enum SplitState {
    Proposed,
    Approved,
    Rejected
  }

  struct SplitT {
    // How many tokens per period we want to pass
    uint tokensPerPeriod;
    // By whom was this split proposed. Another signaturer must approve too
    address proposerAddress;
    // How many times did we released tokens
    uint claimedPeriods;
    // State of actual split.
    SplitState splitState;
  }
}