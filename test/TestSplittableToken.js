const moment = require('moment');
const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

/*
 * Fields of the splitT structs:
 * struct SplitT {
 *   uint tokensPerPeriod;
 *   address proposalAddress;
 *   uint claimedPeriods;
 *   SplitState splitState;
 * }
 */


const SplitTFields = {
  tokensPerField: 0,
  proposalAddress: 1,
  claimedPeriods:2,
  state: 3
}

const monthsAgo = (nrOfMonths) =>
  moment().subtract(nrOfMonths, 'months').unix();

contract('SplittableTokenAllocation', accounts => {
  // We are adding transactionConfig object to the web3 functions (call and sendTransaction) to change the msg.sender
  const transactionConfig = {
    from: accounts[1]
  }
  it('should initialise splittable allocation token', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 months
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, monthsAgo(1));
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
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, monthsAgo(1));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, monthsAgo(3));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 0;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, monthsAgo(20));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed many times', async () => {
    // test partner allocation with locked tokens for 18 months
    const partnerTokenAllocation = await SplittableTokenAllocation.new(0x0, 1000, 1, 18, monthsAgo(54));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

});
