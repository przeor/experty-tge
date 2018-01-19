const Multisig = artifacts.require('Multisig');

contract('Multisig', accounts => {
  let multisig;

  it('should initialize experty multisig', async () => {
    multisig = await Multisig.new(accounts[0], accounts[1], accounts[2]);

    let isSignatory = await multisig.isSignatory.call(accounts[0]);
    assert.isTrue(isSignatory, 'Accounts[0] is not signatory');
    
    isSignatory = await multisig.isSignatory.call(accounts[1]);
    assert.isTrue(isSignatory, 'Accounts[1] is not signatory');
    
    isSignatory = await multisig.isSignatory.call(accounts[2]);
    assert.isTrue(isSignatory, 'Accounts[2] is not signatory');

    isSignatory = await multisig.isSignatory.call(accounts[3]);
    assert.isFalse(isSignatory, 'Accounts[3] should not be signatory');

  });

});
