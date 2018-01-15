const ExpertyToken = artifacts.require('./ExpertyToken');

contract('ExpertyToken', function(accounts) {
  it("should put 10000 ExpertyToken in the first account", function() {
    ExpertyToken.addContribution(accounts[0], 11).then(() => { return console.log('True')})
  });
});
