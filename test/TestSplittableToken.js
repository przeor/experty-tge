const moment = require('moment');
const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

// positions of field from splitT struct
// struct SplitT {
//   address dest;
//   uint tokensPerPeriod;
//   bool isApproved;
//   address proposalAddress;
//   uint claimedPeriods;
// }

const DEST_FIELD = 0;
const TOKENS_PER_PERIOD_FIELD = 1;
const IS_APPROVED_FIELD = 2;
const PROPOSAL_ADDRESS_FIELD = 3;
const CLAIMED_PERIODS_FIELD = 4;

contract('SplittableTokenAllocation', accounts => {
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
    const transactionConfig = {
      from: accounts[1]
    }
    const tokensPerPeriod = 100

    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);

    const lastSplitId = (await partnerTokenAllocation.getLastSplitId.call()).toNumber();
    await partnerTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await partnerTokenAllocation.splits.call(lastSplitId);
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
    assert.equal(tokensPerPeriod, split[TOKENS_PER_PERIOD_FIELD], ' tokens per period has not been set correctly')
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(80, 'days').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const transactionConfig = {
      from: accounts[1]
    }

    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, 100, transactionConfig);

    const lastSplitId = (await partnerTokenAllocation.getLastSplitId.call()).toNumber();
    await partnerTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await partnerTokenAllocation.splits.call(lastSplitId);
    const expectedTokensToMint = 0; // = 0 [periods] * 100 [tokensPerPeriod]
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
    const howMuchTokensToMint = (await partnerTokenAllocation.howMuchTokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, howMuchTokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(20, 'months').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const transactionConfig = {
      from: accounts[1]
    }

    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, 100, transactionConfig);

    const lastSplitId = (await partnerTokenAllocation.getLastSplitId.call()).toNumber();
    await partnerTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await partnerTokenAllocation.splits.call(lastSplitId);
    const expectedTokensToMint = 100; // = 1 [periods] * 100 [tokensPerPeriod]
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
    const howMuchTokensToMint = (await partnerTokenAllocation.howMuchTokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, howMuchTokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed and add second split', async () => {
    // test partner allocation with locked tokens for 18 months
    const MOCK_INIT_TIMESTAMP = moment().subtract(20, 'months').unix();
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, MOCK_INIT_TIMESTAMP);
    const destAddr = accounts[1];
    const transactionConfig = {
      from: accounts[1]
    }
    // 1st count tokens
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, 100, transactionConfig);

    const lastSplitId = (await partnerTokenAllocation.getLastSplitId.call()).toNumber();
    await partnerTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await partnerTokenAllocation.splits.call(lastSplitId);
    const expectedTokensToMint = 100; // = 1 [periods] * 100 [tokensPerPeriod]
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
    const howMuchTokensToMint = (await partnerTokenAllocation.howMuchTokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, howMuchTokensToMint, 'Tokens to mint has not been count correctly');
    // 2nd count tokens
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, 100, transactionConfig);
    const lastSplitIdAfterSecondClaim = (await partnerTokenAllocation.getLastSplitId.call()).toNumber();
    await partnerTokenAllocation.approveSplit.sendTransaction(lastSplitIdAfterSecondClaim);

    const secondSplit = await partnerTokenAllocation.splits.call(lastSplitIdAfterSecondClaim);
    const expectedTokensToMintAfterSecond = 200; // = 0 [periods] * 100 [tokensPerPeriod]
    assert.isTrue(secondSplit[IS_APPROVED_FIELD], 'Split is not approved');
    const howMuchTokensToMintSecond = (await partnerTokenAllocation.howMuchTokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMintAfterSecond, howMuchTokensToMintSecond, 'Tokens to mint has not been count correctly');
  });

});
