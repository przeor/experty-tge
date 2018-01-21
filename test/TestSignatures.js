const Signatures = artifacts.require('Signatures');
const OwnedBySignaturers = artifacts.require('OwnedBySignaturers');

contract('Signatures', accounts => {
  let signatures;

  it('should initialize experty signatures', async () => {
    signatures = await Signatures.new(accounts[0], accounts[1], accounts[2]);

    let existSignature = await signatures.exist.call(accounts[0]);
    assert.isTrue(existSignature, 'accounts[0] is not a signatory');

    existSignature = await signatures.exist.call(accounts[1]);
    assert.isTrue(existSignature, 'accounts[1] is not a signatory');

    existSignature = await signatures.exist.call(accounts[2]);
    assert.isTrue(existSignature, 'accounts[2] is not a signatory');

    existSignature = await signatures.exist.call(accounts[3]);
    assert.isFalse(existSignature, 'accounts[3] should not be a signatory');

  });

  it('should initialize owned by signatures contract', async () => {
    ownedBySignaturers = await OwnedBySignaturers.new(accounts[0], accounts[1], accounts[2]);
  });

});
