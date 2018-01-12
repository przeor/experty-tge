import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "./ExpertyToken";

contract TestExpertyToken {
    function testInitialBalanceUsingDeployedContract() {
        ExpertyToken meta = new ExpertyToken();

        uint expected = 10000;

        Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 ExpertyToken initially");
    }

    function testInitialBalanceWithNewExpertyToken() {
        ExpertyToken meta = new ExpertyToken();

        uint expected = 10000;

        Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 ExpertyToken initially");
    }
}
