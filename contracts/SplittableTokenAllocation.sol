pragma solidity ^0.4.4;

library SafeMath {
  function min(uint a, uint b) pure internal returns (uint) {
    if(a > b)
      return b;
    else
      return a;
  }
}

contract SplittableTokenAllocation {

  // This contract describes how the tokens are being released in time
  // At the begining we have all tokens on the virtual address
  // We assume the we cannot withdraw money from this vierual adress

  // How many distributions periods there are
  uint public periods;
  // How long is one interval
  uint public monthsInPeriod;
  // Virtual address were we keep the initial tokens
  address public virtualAddress;
  // Total amount of remaining tokens to be distributed
  uint public remainingTokensPerPeriod;
  // Total amount of all tokens
  uint public totalSupply;
  // Inital timestamp
  uint public initTimestamp;

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
    // By whom was this split proposed. We use 2 of 3 multisig
    address proposalAddress;
    // How many times did we released tokens
    uint claimedPeriods;
    // State of actual split.
    SplitState splitState;
  }

  // For each address we can add exactly one possible split.
  // If we try to add another proposal on existing address it will be rejected
  mapping (address => SplitT) public splitOf;

  /**
   * SplittableTokenAllocation contructor.
   * RemainingTokensPerPeriod variable which represents
   * the remaining amount of tokens to be distributed
   */
  function SplittableTokenAllocation(address _virtualAddress, uint _allocationSupply, uint _periods, uint _monthsInPeriod, uint _initalTimestamp) public {
    totalSupply = _allocationSupply;
    periods = _periods;
    monthsInPeriod = _monthsInPeriod;
    remainingTokensPerPeriod = _allocationSupply / _periods;
    virtualAddress = _virtualAddress;
    initTimestamp = _initalTimestamp;
  }

  /**
   * Propose split method adds proposal to the splits Array.
   *
   * @param _dest              - address of the new receiver
   * @param _tokensPerPeriod   - how many tokens we are giving to dest
   */
  function proposeSplit(address _dest, uint _tokensPerPeriod) public returns(uint) {
    require(_tokensPerPeriod <= remainingTokensPerPeriod);

    splitOf[_dest] = SplitT({
      tokensPerPeriod: _tokensPerPeriod,
      splitState: SplitState.Proposed,
      proposalAddress: msg.sender,
      claimedPeriods: 0
    });
    remainingTokensPerPeriod = remainingTokensPerPeriod - _tokensPerPeriod; // TODO safe-math
  }

  /**
   * Approves the split allocation, so it can be claimed after periods
   *
   * @param _address - address for the split
   */
  function approveSplit(address _address) public {
    require(splitOf[_address].splitState == SplitState.Proposed);
    require(splitOf[_address].proposalAddress != msg.sender);
    splitOf[_address].splitState = SplitState.Approved;
  }

 /**
   * Rejects the split allocation
   *
   * @param _address - address for the split to be rejected
   */
  function rejectSplit(address _address) public {
    require(splitOf[_address].splitState == SplitState.Proposed);
    splitOf[_address].splitState = SplitState.Rejected;
    remainingTokensPerPeriod = remainingTokensPerPeriod + splitOf[_address].tokensPerPeriod;
  }

  /**
   * Returns how many tokens are available to mint.
   *
   * @param _address - address for whom we are counting tokens
   */
  function tokensToMint(address _address) public view returns (uint) {
    SplitT storage split = splitOf[_address];
    if (split.splitState == SplitState.Approved) {
      return _tokensToMint(split);
    }
    return 0;
  }

  /*
   * _tokensToMint returs the total amount of tokens that are ready to be minted.
   *  From starting date initTimestamp, after each period the split.tokensPerPeriod
   *  are available to be mint.
   *  We calculate numberOfPeriods number from (0..periods) and then multiply it
   *  by the number of tokens per period
   */
  function _tokensToMint(SplitT storage split) private view returns (uint) {
    // I use math min cause when elapsed periods count is higher than periods
    // declareted for one split we have to use subtraction from declarated periods.
    uint numberOfPeriods = SafeMath.min(_periodsElapsed(), periods);
    return (numberOfPeriods - split.claimedPeriods) * split.tokensPerPeriod;
  }

  /*
   * _periodsElapsed returns the amount of periods that passed from initTimestampe
   */
  function _periodsElapsed() public view returns(uint) {
    uint periodsElapsed = ((block.timestamp - initTimestamp) / (monthsInPeriod * (1 years / 12) ));
    return periodsElapsed;
  }
  /**
   * Minting tokens and updating the claimedPeriod value for split
   *
   * @param _address - address for whom we minting
   */
  function mint(address _address) public returns (uint) {
    uint tokens = _tokensToMint(splitOf[_address]);
    splitOf[_address].claimedPeriods = _periodsElapsed();
    return tokens;
  }

}
