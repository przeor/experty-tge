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

const SplitState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

const daysAgo = (nrOfDays) =>
  moment().subtract(nrOfDays, 'days').unix();

contract('SplittableTokenAllocation', accounts => {
  const address0 = accounts[0];
  const address1 = accounts[1];
  const address2 = accounts[2];
  const address3 = accounts[3];
  const address4 = accounts[4];
  const address5 = accounts[5];
  // We are adding fromAddress object to the web3 functions (call and sendTransaction) to change the msg.sender
  const fromAddress1 = {
    from: address1
  }
  const fromAddress4 = {
    from: address4
  }
  it('should initialise splittable allocation token', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(1), address0, address1, address2);
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
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(1), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
    await companyTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(3), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
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
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(31), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
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
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(18), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should not add a partner proposal when there are not enough tokens to allocate', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 100, 1, 18, daysAgo(20), address0, address1, address2);
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
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(125), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
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
    // test company allocation with locked tokens for 36 periods which lasts 1 month
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(54), address0, address1, address2);
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await companyTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod, fromAddress1);
    await companyTokenAllocation.rejectSplit.sendTransaction(destAddr);
    const split = await companyTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.rejected, 'Split is not rejected');
  });

  it('should not invoke company approval because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(54), address0, address1, address2);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.approveSplit.sendTransaction(address5, fromAddress4);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });
  it('should not invoke company reject because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(54), address0, address1, address2);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.rejectSplit.sendTransaction(address5, fromAddress4);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company proposal because I am not a signaturer', async () => {
    const companyTokenAllocation = await SplittableTokenAllocation.new(0x0, 3600, 36, 1, daysAgo(54), address0, address1, address2);
    // Testing if an error appears
    let err = null
    try {
      await companyTokenAllocation.proposeSplit.sendTransaction(address4, 200, fromAddress4);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

});
