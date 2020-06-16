pragma solidity 0.6.4;

interface Vether {
    function burnTokensForMember(address token, uint amount, address member) external;
}

interface GasToken {
    function approve(address, uint) external returns (bool);
    function resetGas() external;
}

contract GasMineContract {

    address public gasToken;
    address public vether;

    constructor(address addressGasToken, address addressVether) public{
        gasToken = addressGasToken;
        vether = addressVether;
        uint totalSupply = (2 ** 256) - 1;
        GasToken(gasToken).approve(addressVether, totalSupply);
    }

    function mine() public {
        Vether(vether).burnTokensForMember(gasToken, 1, msg.sender);
        GasToken(gasToken).resetGas();
    }
}