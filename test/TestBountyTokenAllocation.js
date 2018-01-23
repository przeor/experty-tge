const BountyTokenAllocation = artifacts.require('BountyTokenAllocation');

/*
 * Fields of the BountyAllocationType:
 * struct AllocationType {
 *   address dest;
 *   int amount;
 *   address proposalAddress;
 *   BountyState bountyState;
 * }
 */

const BountyTFields = {
  amountField: 0,
  proposalAddressField: 1,
  bountyStateField: 2
}

const BountyState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

contract('BountyTokenAllocation', accounts => {
  let bta; //shortcut for bountyTokenAlloaction
  const address0 = accounts[0];
  const address1 = accounts[1];
  const address2 = accounts[2];
  const address3 = accounts[3];
  const address4 = accounts[4];
  const address5 = accounts[5];
  const fromAddress1 = {
    from: address1
  }

  it('should initialize bounty token allocation', async () => {
    const TOTAL_BOUNTY_TOKENS = 300;
    bta = await BountyTokenAllocation.new(TOTAL_BOUNTY_TOKENS);
  });

  it('should add a bounty proposal', async () => {
    await bta.proposeBountyTransfer.sendTransaction(address2, 100);
    let bountyOfAddress2 = await bta.bountyOf.call(address2);
    assert.equal(bountyOfAddress2[BountyTFields.amountField], 100, "Should set bounty amount");
    assert.equal(bountyOfAddress2[BountyTFields.proposalAddressField], address0, "Should set bounty proposal address");
    assert.equal(bountyOfAddress2[BountyTFields.bountyStateField], BountyState.proposed, "Should be in proposed state");
  });

  it('should accept a bounty proposal', async () => {
    await bta.approveBountyTransfer.sendTransaction(address2);
    bountyOfAddress2 = await bta.bountyOf.call(address2);
    assert.equal(bountyOfAddress2[BountyTFields.bountyStateField], BountyState.approved, "Should be in proposed state");
  });

  it('should not add a second bounty proposal for address', async () => {
    // Testing if an error appears
    let err = null
    try {
      await bta.proposeBountyTransfer.sendTransaction(address2, 100);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should not add a bounty proposal when there are not enough tokens to allocate', async () => {
    // Testing if an error appears
    let err = null
    try {
      await bta.proposeBountyTransfer.sendTransaction(address3, 201);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should reject a bounty proposal', async () => {
    await bta.proposeBountyTransfer.sendTransaction(address4, 200);
    await bta.rejectBountyTransfer.sendTransaction(address4);
    const bountyOfAddress4 = await bta.bountyOf.call(address4);
    assert.equal(bountyOfAddress4[BountyTFields.bountyStateField], BountyState.rejected, "Should be in rejected state");
  });

  it('should be able to add another proposal', async () => {
    await bta.proposeBountyTransfer.sendTransaction(address5, 200);
    const bountyOfAddress5 = await bta.bountyOf.call(address5);
    assert.equal(bountyOfAddress5[BountyTFields.bountyStateField], BountyState.proposed, "Should be in rejected state");
  });

  it('should not invoke bounty approval because I am not the owner', async () => {
    // Testing if an error appears
    let err = null
    try {
      await bta.approveBountyTransfer.sendTransaction(address5, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke bounty reject because I am not the owner', async () => {
    // Testing if an error appears
    let err = null
    try {
      await bta.rejectBountyTransfer.sendTransaction(address5, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke bounty proposal because I am not the owner', async () => {
    // Testing if an error appears
    let err = null
    try {
      await bta.proposeBountyTransfer.sendTransaction(address4, 200, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });
});
