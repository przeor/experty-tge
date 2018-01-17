const ExpertyToken = artifacts.require('./contracts/ExpertyToken');

contract('ExpertyToken', accounts => {
  let instance = null;
  beforeEach(async () => instance = await ExpertyToken.new());
  afterEach(() => instance = null);
  it("should put 1000 ExpertyToken in the first account", async () => {
    console.log("1");
    instance.balanceOf.call()
  });
});
