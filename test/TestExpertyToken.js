const ExpertyToken = artifacts.require('./contracts/ExpertyToken');

contract('ExpertyToken', accounts => {
  const instance = ExpertyToken.new();
  it("should put 1000 ExpertyToken in the first account", async () => {
    console.log("1");
    instance.balanceOf.call()
  });
});
