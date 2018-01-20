pragma solidity ^0.4.4;


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

  struct SplitT {
    // To whom we are giving tokens
    address dest;
    // How many tokens per period we want to pass
    uint tokensPerPeriod;
    // Was it approved by a signaturer. We use 2 of 3 multisig
    bool isApproved;
    // Address of person who proposed this split
    address proposalAddress;
    // How many times did we released tokens
    uint claimedPeriods;
  }

  SplitT[] public splits;

  /**
   * SplittableTokenAllocation contructor.
   * The most important is the remainingTokensPerPeriod variable which represents
   * the remaining amount of tokens to be distributed
   */
  function SplittableTokenAllocation(address _virtualAddress, uint _totalSupply, uint _periods, uint _monthsInPeriod, uint _initalTimestamp) public {
    totalSupply = _totalSupply;
    periods = _periods;
    monthsInPeriod = _monthsInPeriod;
    remainingTokensPerPeriod = _totalSupply / _periods;
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

    splits.push(SplitT({
      dest: _dest,
      tokensPerPeriod: _tokensPerPeriod,
      isApproved: false,
      proposalAddress: msg.sender,
      claimedPeriods: 0
    }));
  }

  function getLastSplitId() public view returns (uint) {
    return splits.length - 1;
  }

  function approveSplit(uint splitId) public {
    require(!splits[splitId].isApproved);
    require(splits[splitId].proposalAddress != msg.sender);
    splits[splitId].isApproved = true;
  }

  /**
   * Returns how many tokens are available to mint. We need to calculate how many periods
   * have passed.
   *
   * @param _address - address for whom we are counting tokens
   */
  function howMuchTokensToMint(address _address) public returns (uint) {
    uint toMint = 0;
    for (uint i = 0; i < splits.length; i++) {
      if (splits[i].isApproved && splits[i].dest == _address) {
        toMint = toMint + _tokensToMint(i);//splits[i].tokensPerPeriod; // TODO count how many are available to be mint based on claimedPeriods
      }
    }
    return toMint;
  }
  function _tokensToMint(uint splitId) private returns (uint) {
    return (_periodsElapsed() - splits[splitId].claimedPeriods) * splits[splitId].tokensPerPeriod;
  }

  function _periodsElapsed() public returns(uint) {
    uint periodsElapsed = ((block.timestamp - initTimestamp) / (monthsInPeriod * (1 years / 12) ));
    return periodsElapsed;
  }
  /**
   * Counting how many tokens should we mint and then updating the splits array where we
   * update the number of claimed periods
   *
   * @param _address - address for whom we minting
   */
  function claim(address _address) public returns (uint) {
    uint toMint = 0;
    for (uint i = 0; i < splits.length; i++) {
      if (splits[i].isApproved && splits[i].dest == _address) {
        toMint = toMint + splits[i].tokensPerPeriod; // TODO
        splits[i].claimedPeriods = 22; // TODO
      }
    }
    return toMint;
  }

}
