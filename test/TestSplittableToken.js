const moment = require('moment');
const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

// positions of field from splitT struct
// struct SplitT {
  // uint tokensPerPeriod;
  // address proposalAddress;
  // uint claimedPeriods;
  // SplitState splitState;
// }

const TOKENS_PER_PERIOD_FIELD = 0;
const PROPOSAL_ADDRESS_FIELD = 1;
const CLAIMED_PERIODS_FIELD = 2;
const SPLIT_STATE_FIELD = 3;

contract('SplittableTokenAllocation', accounts => {
  const transactionConfig = {
    from: accounts[1]
  }
  it('should initialise splittable allocation token', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(40, 'days').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const virtualAddress = await partnerTokenAllocation.virtualAddress.call();
    assert.equal(virtualAddress, 0x0, 'Virtual address has not been set correctly');
    const totalSupply = await partnerTokenAllocation.totalSupply.call();
    assert.equal(totalSupply, 1000, 'Total supply has not been set correctly');
    const periods = await partnerTokenAllocation.periods.call();
    assert.equal(periods, 1, 'Period has not been set correctly');
    const monthsInPeriod = await partnerTokenAllocation.monthsInPeriod.call();
    assert.equal(monthsInPeriod, 18, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(40, 'days').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SPLIT_STATE_FIELD], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[TOKENS_PER_PERIOD_FIELD], ' tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(80, 'days').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SPLIT_STATE_FIELD], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[TOKENS_PER_PERIOD_FIELD], ' tokens per period has not been set correctly');
    const expectedTokensToMint = 0;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(20, 'months').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SPLIT_STATE_FIELD], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[TOKENS_PER_PERIOD_FIELD], ' tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed two times', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(54, 'months').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SPLIT_STATE_FIELD], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[TOKENS_PER_PERIOD_FIELD], ' tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

});
