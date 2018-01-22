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
  claimedPeriods: 2,
  state: 3
}

const SplitState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

const minutesInMonth = 60 * 24 * 365 / 12;

const minutesAgo = (nrOfMinutes) =>
  moment().subtract(nrOfMinutes, 'minutes').unix();

contract('Test company tokens alloctions', accounts => {
  const address1 = accounts[1];
  const address2 = accounts[2];
  const address3 = accounts[3];
  // We are adding fromAddress object to the web3 functions (call and sendTransaction) to change the msg.sender
  const fromAddress1 = {
    from: address1
  }
  it('should initialise splittable allocation token', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(1));
    // check that total supply is set correctly
    const totalSupply = await companyTokenAllocation.totalSupply.call();
    assert.equal(totalSupply, 3600, 'Total supply has not been set correctly');
    // check that periods are set corretly for partners
    const periods = await companyTokenAllocation.periods.call();
    assert.equal(periods, 36, 'Period has not been set correctly');
    // check that months in period is set corretly for partners
    const minutesInPeriod = await companyTokenAllocation.minutesInPeriod.call();
    assert.equal(minutesInPeriod, minutesInMonth, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600, 36, minutesInMonth, minutesAgo(1));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600, 36, minutesInMonth, minutesAgo(3));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 0;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, 20, minutesAgo(31));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('should not add a second partner proposal for address', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(18));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should not add a partner proposal when there are not enough tokens to allocate', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(100, 1, 18 * minutesInMonth, minutesAgo(20));
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(accounts[2], 200, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('sholud count claimed tokens value after period has passed many times', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, 26, minutesAgo(125));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    // 4 periods passed - 125 days means 4 months and 3 days
    const expectedTokensToMint = 400;
    const tokensToMint = (await companyTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    // tokens to mint should equal declarated tokens per period,
    // when period has passed many times, for partners tokens are set to one period
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud reject proposed split', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 minute
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(54));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await companyTokenAllocation.rejectSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.rejected, 'Split is not rejected');
  });

  it('should not invoke company approval because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.approveSplit.sendTransaction(address5, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company reject because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.rejectSplit.sendTransaction(address2, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company proposal because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(3600/36, 36, minutesInMonth, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(address3, 200, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

});
