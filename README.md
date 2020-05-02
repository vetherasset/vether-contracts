# Vether - A strictly-scarce ethereum-based asset

## Smart Contract

The Vether smart contracts implements the [Vether whitepaper](https://bitcointalk.org/index.php?topic=5243406) announced on 25 April 2020. 

### ERC-20
Vether is an ERC-20 contract that implements the following interface:
```Solidity
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
```

### UniSwap Factory and Exchange
Vether uses the UniSwap Factory and Exchange contracts to enable swapping tokens for Ether at market prices:

```Solidity
// Uniswap Factory Interface
interface UniswapFactory {
    function getExchange(address token) external view returns (address exchange);
    }
// Uniswap Exchange Interface
interface UniswapExchange {
    function tokenToEthTransferInput(uint256 tokens_sold,uint256 min_eth,uint256 deadline, address recipient) external returns (uint256  eth_bought);
    }
```

### Vether Public Get Methods
The following public getters are available to query:
```javascript
// Public Parameters
uint256 public emission;
uint public currentEra; uint public currentDay;
uint public daysPerEra; uint public secondsPerDay;
uint public genesis; uint public nextEraTime; uint public nextDayTime;
address payable public burnAddress;
address[2] public registryAddrArray; bool public registryAdded;
uint256 public totalFees; uint256 public totalBurnt;

// Public Mappings
mapping(uint=>uint256) public mapEra_Emission;
mapping(uint=>mapping(uint=>uint256)) public mapEraDay_Units;
mapping(uint=>mapping(uint=>uint256)) public mapEraDay_UnitsRemaining;
mapping(uint=>mapping(uint=>uint256)) public mapEraDay_Emission;
mapping(uint=>mapping(uint=>uint256)) public mapEraDay_EmissionRemaining;
mapping(uint=>mapping(uint=>mapping(address=>uint256))) public mapEraDay_MemberUnits;
mapping(address=>mapping(uint=>uint[])) public mapMemberEra_Days; 

// Public Get Functions
function getExchange(address token ) public view returns (address)
function getDaysContributedForEra(address member, uint era) public view returns(uint days)
function getEmissionShare(uint era, uint day, address member) public view returns (uint256 emissionShare)
function getNextEraEmission() public view returns (uint256)
function getDayEmission() public view returns (uint256)
```

### Vether Public Transactions
The following public transaction functions are available to call:
```javascript
receive() external payable
function burnEtherForMember(address member) external payable
function burnTokens(address token, uint256 amount) external
function burnTokensForMember(address token, uint256 amount, address member) external 
function addRegistry(address registry, uint index) public
function withdrawShare(uint era, uint day) external 
function withdrawShareForMember(uint era, uint day, address member) external
```

### Constructor
There are three constructor options:

**Local**
This allows efficient testing locally, with 1 second days. 
```javascript
//local
name = "Vether"; symbol = "VETH"; decimals = 18; totalSupply = 8190;
balanceOf[address(this)] = totalSupply; 
emit Transfer(address(0), address(this), totalSupply);                              // Mint the total supply to this address
emission = 2048; currentEra = 1; currentDay = 1;                                    // Set emission, era and day
genesis = now; daysPerEra = 2; secondsPerDay = 1;                                   // Set genesis time
nextEraTime = genesis + (secondsPerDay * daysPerEra);                               // Set next time for coin era
nextDayTime = genesis + secondsPerDay;                                              // Set next time for coin day
burnAddress = 0x39f2cF37802a67690b2CF2c445C709949663FeDc;                           // TEST REMOVE
registryAdded = true;
```

**Rinkeby Testnet**
This allows the contract to be deployed to Rinkeby. It has a lifecycle of 5 days 

```
//testnet
name = "Value"; symbol = "VAL2"; decimals = 18; totalSupply = 16380*10**decimals;
balanceOf[address(this)] = totalSupply;                                          // Mint the total supply to this address
emit Transfer(address(0), address(this), totalSupply);                           
emission = 2048000000000000000000; currentEra = 1; currentDay = 1;               // Set emission, era and day
genesis = now; daysPerEra = 4; secondsPerDay = 10000;                            // Set genesis time
nextEraTime = genesis + secondsPerDay * daysPerEra;                              // Set next time for coin era
nextDayTime = genesis + secondsPerDay;                                           // Set next time for coin day
burnAddress = 0xa5d6fbDeA3F72c4289913BA0637DA417a41d8ED9;
registryAddrArray[0] = 0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36;               // Set UniSwap V1 Rinkeby

```

**Mainnet**
This is the constructor deployed to mainnet:

```
//mainnet
name = "Value"; symbol = "VALH"; decimals = 18; totalSupply = 1000000*10**decimals;
balanceOf[address(this)] = totalSupply; 
emit Transfer(address(0), address(this), totalSupply);                           // Mint the total supply to this address
emission = 2048000000000000000000; currentEra = 1; currentDay = 1;               // Set emission, Era and Day
genesis = now; daysPerEra = 244; secondsPerDay = 84196;                          // Set genesis time
nextEraTime = genesis + secondsPerDay.mul(daysPerEra);                           // Set time for next coin Era
nextDayTime = genesis + secondsPerDay;                                           // Set time for next coin Day
burnAddress = 0x0000000000000000000000000000000000000000;                         // Set Burn Address
registryAddrArray[0] = 0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36;                // Set UniSwap V1 Mainnet
```

## Testing

The test suite implements 6 routines that can be tested individually. The 

```
truffle compile && truffle migrate --reset
```

Execute all at once:
```
truffle test
```

Or execute individually:
```
truffle test test/1_coin.js
```