pragma solidity 0.6.4;

interface TokenInterface {
    function transfer(address, uint) external returns (bool);
    function approve(address, uint) external;
    function transferFrom(address, address, uint) external returns (bool);
}

contract Exchange1 {

	address public token_;

	event TokenToEthPurchase(address indexed buyer, uint256 indexed tokensIn, uint256 indexed ethOut);

	// Creation event
	constructor() public {}

    receive() external payable {}

    function setToken (address _address) public {
        token_ = _address;
    }

    function getToken () external view returns (address) {
        return token_;
    }

        // Buyer swaps Tokens for ETH
    function tokenToEthSwapInput(uint256 _tokenAmount, uint256 _minEth, uint256 _timeout)
        external returns (uint256  eth_bought)
    {
        require(_tokenAmount > 0 && _minEth > 0 && now < _timeout);
        uint256 ethout = _tokenToEth(msg.sender, msg.sender, _tokenAmount, _minEth);
        return ethout;
    }

	    // Payer pays in Tokens, recipient receives ETH
    function tokenToEthTransferInput(
        uint256 _tokenAmount,
        uint256 _minEth,
        uint256 _timeout,
        address payable _recipient
    )
        external returns (uint256  eth_bought)
    {
        require(_tokenAmount > 0 && _minEth > 0 && now < _timeout);
        require(_recipient != address(0) && _recipient != address(this));
        uint256 ethout = _tokenToEth(msg.sender, _recipient, _tokenAmount, _minEth);
        return ethout;
    }

    function _tokenToEth(
        address buyer,
        address payable recipient,
        uint256 tokensIn,
        uint256 minEthOut
    )
        internal
        returns (uint256  ethout)
    {
        require (minEthOut > 0);       
    	uint256 ethOut = 2000000000000000;
        require(TokenInterface(token_).transferFrom(buyer, address(this), tokensIn));
        emit TokenToEthPurchase(buyer, tokensIn, ethOut);
        recipient.transfer(ethOut);
        return ethOut;
    }

}