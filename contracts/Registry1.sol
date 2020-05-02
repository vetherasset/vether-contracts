pragma solidity 0.6.4;


contract Registry1 {

mapping (address => address) registry;		// Token -> Exchange


	// Creation event
	constructor() public {

	}

	function setExchange (address _exchange, address _token) public {	
		registry[_token] = _exchange;
	}
	

	function getExchange(address token) public view returns (address) {
	    //exchange = address(0x0000000000000000000000000000000000000000);
	    return registry[token];
	}

}