// const MultisigExpertyEthControl = artifacts.require('./MultisigExpertyEthControl');

// contract('MultisigExpertyEthControl', accounts => {
//   let multisig;
//   it('should initialize multisig contract', async () => {
//     multisig = await MultisigExpertyEthControl.new();
//     const requiredSignaturesPromise = await multisig.requiredSignatures;
//     assert.isDefined(requiredSignaturesPromise, 'Required signatures is null or undefined');
//     const requiredSignatures = await requiredSignaturesPromise.call();
//     assert(requiredSignatures.eq(2), 'Required signatures has not been set to 2');
//   });
// });
