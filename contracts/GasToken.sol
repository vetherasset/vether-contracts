pragma solidity 0.6.4;

//IERC20 Interface
interface ERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address, uint) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface Vether {
    function burnTokensForMember(address token, uint amount, address member) external;
}

// Token Contract
contract GasToken is ERC20 {

    // Coin Defaults
    string public name = "Gas Coin";
    string public symbol = "VGC";
    uint256 public decimals  = 18;
    uint256 public override totalSupply  = (2 ** 256) - 1;

    address public burnAddress;
    address public vether;

    uint public gasCycles;
    mapping (address => uint) public gasPrice;
    mapping(uint => string) public gasStorage;

    // Mapping
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    // Events
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Minting event
    constructor(address addressVether) public{
        gasCycles = 15;
        burnAddress = 0xE5904695748fe4A84b40b3fc79De2277660BD1D3;
        vether = addressVether;
        allowance[address(this)][addressVether] = totalSupply;
        balanceOf[address(this)] = totalSupply;
        emit Transfer(address(0), address(this), totalSupply);
    }
    
    // ERC20
    function transfer(address to, uint256 value) public override returns (bool success) {
        _transfer(msg.sender, to, value);
        return true;
    }

    // ERC20
    function approve(address spender, uint256 value) public override returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    // ERC20
    function transferFrom(address from, address to, uint256 value) public override returns (bool success) {
        require(value <= allowance[from][msg.sender]);
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }

    // Transfer function which includes the gas storage
    function _transfer(address _from, address _to, uint _value) internal {
        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value >= balanceOf[_to]);    
        balanceOf[_from] = balanceOf[_from] - _value;        
        balanceOf[_to] = balanceOf[_to] + _value;

        if (_to == burnAddress) {
            for(uint i = 0; i < gasCycles; i++){
                gasStorage[i]="GASSTORAGEGASSTORAGEGASTORAGEGASSTORAGEGASSTORAGEGASTORAGEGASSTORAGE";
            }
        }
        emit Transfer(_from, _to, _value);         
    }

    function mine() public {
        Vether(vether).burnTokensForMember(address(this), 1, msg.sender);
        resetGas();
    }

    function resetGas() public {
        for(uint i = 0; i < gasCycles; i++){
            gasStorage[i]="0";
        }
    }
    
}