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

const daysAgo = (nrOfDays) =>
  moment().subtract(nrOfDays, 'days').unix();

contract('SplittableTokenAllocation', accounts => {
  // We are adding transactionConfig object to the web3 functions (call and sendTransaction) to change the msg.sender
  const transactionConfig = {
    from: accounts[1]
  }
  it('should initialise splittable allocation token', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(1));
    // check that virtual address is set correctly
    const virtualAddress = await companyTokenAllocation.virtualAddress.call();
    assert.equal(virtualAddress, 0x0, 'Virtual address has not been set correctly');
    // check that total supply is set correctly
    const totalSupply = await companyTokenAllocation.totalSupply.call();
    assert.equal(totalSupply, 3600, 'Total supply has not been set correctly');
    // check that periods are set corretly for partners
    const periods = await companyTokenAllocation.periods.call();
    assert.equal(periods, 36, 'Period has not been set correctly');
    // check that months in period is set corretly for partners
    const monthsInPeriod = await companyTokenAllocation.monthsInPeriod.call();
    assert.equal(monthsInPeriod, 1, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(1));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(3));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 0;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(31));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('should not add a second partner proposal for address', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(180));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should not add a partner proposal when there are not enough tokens to allocate', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 100, 1, 18, daysAgo(20));
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(accounts[2], 200, transactionConfig);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('sholud count claimed tokens value after period has passed many times', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(125));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 1, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    // 4 periods passed - 125 days means 4 months and 3 days
    const expectedTokensToMint = 400;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    // tokens to mint should equal declarated tokens per period,
    // when period has passed many times, for partners tokens are set to one period
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud reject proposed split', async () => {
    // test partner allocation with locked tokens for 18 months
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(54));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, transactionConfig);
    await companyTokenAllocation.rejectSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], 2, 'Split is not rejected');
  });

});
