pragma solidity 0.6.4;
//ERC20 Interface
interface ERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function transfer(address, uint) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
    }
interface VetherOld {
    function genesis() external view returns (uint);
    function totalFees() external view returns (uint);
    function totalBurnt() external view returns (uint);
    function totalSupply() external view returns (uint);
    function currentDay() external view returns (uint);
    function currentEra() external view returns (uint);
}
library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;
        return c;
    }
}
    //======================================VETHER=========================================//
contract Vether is ERC20 {
    using SafeMath for uint;
    // ERC-20 Parameters
    string public name; string public symbol;
    uint public decimals; uint public override totalSupply;
    // ERC-20 Mappings
    mapping(address => uint) public override balanceOf;
    mapping(address => mapping(address => uint)) public override allowance;
    // Public Parameters
    uint coin; uint public emission;
    uint public currentEra; uint public currentDay;
    uint public daysPerEra; uint public secondsPerDay;
    uint public upgradeHeight; uint public upgradedAmount;
    uint public genesis; uint public nextEraTime; uint public nextDayTime;
    address payable public burnAddress;
    address public vetherOld;
    uint public totalFees; uint public totalBurnt; uint public totalEmitted;

    mapping(address => uint) public mapProposedAddress_Votes;
    mapping(address => uint) public mapMember_Votes;
    mapping(address => address) public mapMember_Vote;
    address public incentiveAddress;

    // Public Mappings
    mapping(uint=>uint) public mapEra_Emission;                                             // Era->Emission
    mapping(uint=>mapping(uint=>uint)) public mapEraDay_Emission;                           // Era,Day->Emission
    mapping(uint=>mapping(uint=>uint)) public mapEraDay_RewardLeft;                         // Era,Day->BurnReward
    mapping(uint=>mapping(uint=>uint)) public mapEraDay_IncentiveLeft;                      // Era,Day->LiquidityIncentive
    mapping(uint=>mapping(uint=>bool)) public mapEraDay_IncentiveClaimed;                   // Era,Day->BoolClaimed
    mapping(uint=>mapping(uint=>uint)) public mapEraDay_Units;                              // Era,Day->Units
    mapping(uint=>mapping(uint=>uint)) public mapEraDay_UnitsRemaining;                     // Era,Day->TotalUnits
    mapping(uint=>mapping(uint=>mapping(address=>uint))) public mapEraDay_MemberUnits;      // Era,Day,Member->Units
    mapping(address=>mapping(uint=>uint[])) public mapMemberEra_Days;                       // Member,Era->Days[]
    mapping(address=>bool) public mapAddress_Excluded;                                      // Address->Excluded
    // Events
    event NewEra(uint era, uint emission, uint time);
    event NewDay(uint era, uint day, uint time);
    event Burn(address indexed payer, address indexed member, uint era, uint day, uint units, uint dailyTotal);
    event Withdrawal(address indexed caller, address indexed member, uint era, uint day, uint value, uint valueRemaining);

    //=====================================CREATION=========================================//
    // Constructor
    constructor(address _vetherOld) public {
        //local
        name = "Vether"; symbol = "VETH"; decimals = 18; 
        coin = 1; totalSupply = 8190*coin;
        daysPerEra = 20; secondsPerDay = 1;
        burnAddress = 0x0111011001100001011011000111010101100101; 
        vetherOld = _vetherOld;
        upgradeHeight = 5;
        emission = 2048*coin; currentEra = 1; currentDay = upgradeHeight;
        genesis = VetherOld(vetherOld).genesis();
        totalBurnt = VetherOld(vetherOld).totalBurnt(); 
        totalFees = VetherOld(vetherOld).totalFees(); 
        totalEmitted = (upgradeHeight-1)*emission;

        //testnet
        // name = "Vether"; symbol = "VETH"; decimals = 18; 
        // coin = 1*10**decimals; totalSupply = 16380*coin;
        // emission = 2048*coin; currentEra = 1; currentDay = 1;                               // Set emission, era and day
        // genesis = now; daysPerEra = 4; secondsPerDay = 10000;                               // Set genesis time
        // burnAddress = 0xa5d6fbDeA3F72c4289913BA0637DA417a41d8ED9;
        // registryAddressArray[0] = 0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36;               // Set UniSwap V1 Rinkeby

        // mainnet
        // name = "Vether"; symbol = "VETH"; decimals = 18; 
        // coin = 1*10**decimals; totalSupply = 1000000*coin;                                  // Set Supply
        // emission = 2048*coin; currentEra = 1; currentDay = 1;                               // Set emission, Era and Day
        // genesis = now; daysPerEra = 244; secondsPerDay = 84200;                             // Set genesis time
        // burnAddress = 0x0111011001100001011011000111010101100101;                           // Set Burn Address
        // registryAddress = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;                       // Set UniSwap V1 Mainnet
        
        balanceOf[address(this)] = totalSupply; 
        emit Transfer(burnAddress, address(this), totalSupply);                             // Mint the total supply to this address
        nextEraTime = genesis + (secondsPerDay * daysPerEra);                               // Set next time for coin era
        nextDayTime = genesis + secondsPerDay;                                              // Set next time for coin day
        mapAddress_Excluded[address(this)] = true;                                          // Add this address to be excluded from fees
        mapEra_Emission[currentEra] = emission;                                             // Map Starting emission
        mapEraDay_Emission[currentEra][currentDay] = emission;
        mapEraDay_RewardLeft[currentEra][currentDay] = emission/2; 
        mapEraDay_IncentiveLeft[currentEra][currentDay] = emission/2;
        mapEraDay_IncentiveClaimed[currentEra][currentDay] = false;
    }

    //========================================ERC20=========================================//
    // ERC20 Transfer function
    function transfer(address to, uint value) public override returns (bool success) {
        _transfer(msg.sender, to, value);
        return true;
    }
    // ERC20 Approve function
    function approve(address spender, uint value) public override returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    // ERC20 TransferFrom function
    function transferFrom(address from, address to, uint value) public override returns (bool success) {
        require(value <= allowance[from][msg.sender], 'Must not send more than allowance');
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }
    // Internal transfer function which includes the Fee
    function _transfer(address _from, address _to, uint _value) private {
        require(balanceOf[_from] >= _value, 'Must not send more than balance');
        require(balanceOf[_to] + _value >= balanceOf[_to], 'Balance overflow');
        _removeVotes(_from);
        balanceOf[_from] -= _value;
        uint _fee = _getFee(_from, _to, _value);                                            // Get fee amount
        balanceOf[_to] += (_value - _fee);                                                  // Add to receiver
        balanceOf[address(this)] += _fee;                                                   // Add fee to self
        totalFees += _fee;                                                                  // Track fees collected
        emit Transfer(_from, _to, (_value - _fee));                                         // Transfer event
        if (!mapAddress_Excluded[_from] && !mapAddress_Excluded[_to]) {
            emit Transfer(_from, address(this), _fee);                                      // Fee Transfer event
        }
    }
    // Calculate Fee amount
    function _getFee(address _from, address _to, uint _value) private view returns (uint) {
        if (mapAddress_Excluded[_from] || mapAddress_Excluded[_to]) {
           return 0;                                                                        // No fee if excluded
        } else {
            return (_value / 1000);                                                         // Fee amount = 0.1%
        }
    }
    // Allow to query for remaining upgrade amount
    function getRemainingAmount() public view returns (uint amount){
        amount = ((upgradeHeight-1) * mapEra_Emission[1]).sub(VetherOld(vetherOld).totalFees()).sub(upgradedAmount);
        return amount;
    }
    // Allow any holder of the old asset to upgrade
    function upgrade(uint amount) public returns (bool success){
        uint remainingAmount = getRemainingAmount();
        require((remainingAmount >= amount), "Must not upgrade more than allowed");
        upgradedAmount += amount;                                                           // Record upgrade amount
        ERC20(vetherOld).transferFrom(msg.sender, burnAddress, amount);                     // Must collect & burn tokens
        _transfer(address(this), msg.sender, amount);                                       // Send to owner
        return true;
    }

    //==================================PROOF-OF-VALUE======================================//
    // Calls when sending Ether
    receive() external payable {
        require(VetherOld(vetherOld).currentDay() >= upgradeHeight);                        // Prohibit until upgrade height
        burnAddress.call.value(msg.value)("");                                              // Burn ether
        _recordBurn(msg.sender, msg.sender, currentEra, currentDay, msg.value);             // Record Burn
    }
    // Burn ether for nominated member
    function burnEtherForMember(address member) external payable {
        require(VetherOld(vetherOld).currentDay() >= upgradeHeight);                        // Prohibit until upgrade height
        burnAddress.call.value(msg.value)("");                                              // Burn ether
        _recordBurn(msg.sender, member, currentEra, currentDay, msg.value);                 // Record Burn
    }
    // Internal - Records burn
    function _recordBurn(address _payer, address _member, uint _era, uint _day, uint _eth) private {
        if (mapEraDay_MemberUnits[_era][_day][_member] == 0){                               // If hasn't contributed to this Day yet
            mapMemberEra_Days[_member][_era].push(_day);                                    // Add it
        }
        mapEraDay_MemberUnits[_era][_day][_member] += _eth;                                 // Add member's share
        mapEraDay_UnitsRemaining[_era][_day] += _eth;                                       // Add to total historicals
        mapEraDay_Units[_era][_day] += _eth;                                                // Add to total outstanding
        totalBurnt += _eth;                                                                 // Add to total burnt
        emit Burn(_payer, _member, _era, _day, _eth, mapEraDay_Units[_era][_day]);          // Burn event
        _updateEmission();                                                                  // Update emission Schedule
    }
    // Allows adding an excluded address, once per Era
    function addExcluded(address excluded) external {                   
        _transfer(msg.sender, address(this), mapEra_Emission[1]/16);                        // Pay fee of 128 Vether
        mapAddress_Excluded[excluded] = true;                                               // Add desired address
    }
    //======================================WITHDRAWAL======================================//
    // Used to efficiently track participation in each era
    function getDaysContributedForEra(address member, uint era) public view returns(uint){
        return mapMemberEra_Days[member][era].length;
    }
    // Call to withdraw a claim
    function withdrawShare(uint era, uint day) external returns (uint value) {
        value = _withdrawShare(era, day, msg.sender);                           
    }
    // Call to withdraw a claim for another member
    function withdrawShareForMember(uint era, uint day, address member) external returns (uint value) {
        value = _withdrawShare(era, day, member);
    }
    // Internal - withdraw function
    function _withdrawShare (uint _era, uint _day, address _member) private returns (uint value) {
        if (_era < currentEra) {                                                            // Allow if in previous Era
            value = _processWithdrawal(_era, _day, _member);                                // Process Withdrawal
        } else if (_era == currentEra) {                                                    // Handle if in current Era
            if (_day < currentDay) {                                                        // Allow only if in previous Day
                value = _processWithdrawal(_era, _day, _member);                            // Process Withdrawal
            }
        }  
        _updateEmission(); 
        return value;
    }
    // Internal - Withdrawal function
    function _processWithdrawal (uint _era, uint _day, address _member) private returns (uint value) {
        uint memberUnits = mapEraDay_MemberUnits[_era][_day][_member];                      // Get Member Units
        if (memberUnits == 0) { 
            value = 0;                                                                      // Do nothing if 0 (prevents revert)
        } else {
            value = getEmissionShare(_era, _day, _member);                                  // Get the emission Share for Member
            mapEraDay_MemberUnits[_era][_day][_member] = 0;                                 // Set to 0 since it will be withdrawn
            mapEraDay_UnitsRemaining[_era][_day] -= memberUnits;                            // Decrement Member Units
            mapEraDay_RewardLeft[_era][_day] -= value;                                      // Decrement reward
            totalEmitted += value;                                                          // Increment total emitted
            _transfer(address(this), _member, value);                                       // ERC20 transfer function
            emit Withdrawal(msg.sender, _member, _era, _day, 
            value, mapEraDay_RewardLeft[_era][_day]);
        }
        return value;
    }
         // Get emission Share function
    function getEmissionShare(uint era, uint day, address member) public view returns (uint value) {
        uint memberUnits = mapEraDay_MemberUnits[era][day][member];                         // Get Member Units
        if (memberUnits == 0) {
            return 0;                                                                       // If 0, return 0
        } else {
            uint totalUnits = mapEraDay_UnitsRemaining[era][day];                           // Get Total Units
            uint rewardLeft = mapEraDay_RewardLeft[era][day];                               // Get reward remaining for Day
            uint balance = balanceOf[address(this)];                                        // Find remaining balance
            if (rewardLeft*2 > balance) { rewardLeft = balance/2; }                         // In case less than required reward
            value = (rewardLeft * memberUnits) / totalUnits;                                // Calculate share
            return  value;                            
        }
    }

    //======================================INCENTIVES========================================//
    // Public - Claim Incentive for day
    function claimIncentive(uint era, uint day) public returns (uint value){
        require(!mapEraDay_IncentiveClaimed[era][day], "already claimed for day");
        require(msg.sender == incentiveAddress, "must claim from incentive address");
        uint incentive = mapEraDay_IncentiveLeft[era][day];
        mapEraDay_IncentiveLeft[era][day] -= incentive;
        mapEraDay_IncentiveClaimed[era][day] = true;
        _transfer(address(this), incentiveAddress, incentive);
    }
    // Public - vote on a change of incentive address from address
    function voteWithBalance(address proposedAddress) public returns (bool success){
        _removeVotes(msg.sender);
        uint balance = balanceOf[msg.sender];
        mapMember_Votes[msg.sender] = balance;
        mapMember_Vote[msg.sender] = proposedAddress;
        mapProposedAddress_Votes[proposedAddress] += balance;
        return checkThreshold(proposedAddress);
    }
    // Public - vote on a change of incentive address from contract
    function voteFromContract(address proposedAddress, address member, uint balance) public returns (bool success){
        _removeVotes(member);
        mapMember_Votes[member] = balance;
        mapMember_Vote[member] = proposedAddress;
        mapProposedAddress_Votes[proposedAddress] += balance;
        return checkThreshold(proposedAddress);
    }

    function checkThreshold(address _proposedAddress) private returns(bool) {
        uint thresholdApproval = totalEmitted / 2;
        if(mapProposedAddress_Votes[_proposedAddress] > thresholdApproval){
            incentiveAddress = _proposedAddress;
            return true;
        } else {
            return false;
        }
    }
    function removeVotes() public returns (bool success){
        _removeVotes(msg.sender);
    }
    function _removeVotes(address member) private {
        uint oldVotes = mapMember_Votes[member];
        if(oldVotes > 0 ){
            uint oldAddress = mapMember_Vote[member];
            mapProposedAddress_Votes[oldAddress] -= oldVotes;
        }
    }

    //======================================EMISSION========================================//
    // Internal - Update emission function
    function _updateEmission() private {
        uint _now = now;                                                                    // Find now()
        if (_now >= nextDayTime) {                                                      // If time passed the next Day time
            if (currentDay >= daysPerEra) {                                             // If time passed the next Era time
                currentEra += 1; currentDay = 0;                                        // Increment Era, reset Day
                nextEraTime = _now + (secondsPerDay * daysPerEra);                      // Set next Era time
                emission = getNextEraEmission();                                        // Get correct emission
                mapEra_Emission[currentEra] = emission;                                 // Map emission to Era
                emit NewEra(currentEra, emission, nextEraTime);                         // Emit Event
            }
            currentDay += 1;                                                            // Increment Day
            nextDayTime = _now + secondsPerDay;                                         // Set next Day time
            emission = getDayEmission();                                                // Check daily Dmission
            mapEraDay_Emission[currentEra][currentDay] = emission;                      // Map emission to Day
            mapEraDay_RewardLeft[currentEra][currentDay] = emission/2;                  // Map reward to Day
            mapEraDay_IncentiveLeft[currentEra][currentDay] = emission/2;               // Map incentive to Day
            emit NewDay(currentEra, currentDay, nextDayTime);                           // Emit Event
        }
    }
    // Calculate Era emission
    function getNextEraEmission() public view returns (uint) {
        if (emission > coin) {                                                              // Normal Emission Schedule
            return emission / 2;                                                            // Emissions: 2048 -> 1.0
        } else{                                                                             // Enters Fee Era
            return coin;                                                                    // Return 1.0 from fees
        }
    }
    // Calculate Day emission
    function getDayEmission() public view returns (uint) {
        uint balance = balanceOf[address(this)];                                            // Find remaining balance
        if (balance > emission) {                                                           // Balance is sufficient
            return emission;                                                                // Return emission
        } else {                                                                            // Balance has dropped low
            return balance;                                                                 // Return full balance
        }
    }
}