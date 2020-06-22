pragma solidity 0.6.4;

interface Vether {
    function transferFrom(address from, address to, uint value) external returns (bool success);
	function transfer(address to, uint value) external returns (bool success);
	}

contract Pools {

	address public vether;
	uint public balance;

	// Creation event
	constructor(address _vether) public {
		vether = _vether;
	}

	function deposit (uint amount) public {	
		Vether(vether).transferFrom(msg.sender, address(this), amount);
		balance += amount;
	}
	

	function withdraw() public {
	    Vether(vether).transfer(msg.sender, balance);
		balance -= balance;
	}

}