
```javascript
    // Allow any holder of the old asset to upgrade
    function upgrade(uint amount) public returns (bool success){
        // upgrade giant amount
        uint _amount = amount;
        if(mapPreviousOwnership[msg.sender] < amount){_amount = mapPreviousOwnership[msg.sender];} // Upgrade as much as possible
        // 1) only previous owner
        // 2) if giant amount, then _amount = their snapshot
        uint remainingAmount = getRemainingAmount();
        // gets remaining, ie 33k VETH
        if(remainingAmount < amount){_amount = remainingAmount;}                            // Handle final amount
        // 33k VETH is less than giant amount, so _amount goes from snapshot up to 33k VETH
        upgradedAmount += _amount; mapPreviousOwnership[msg.sender] -= _amount;             // Update mappings
        // upgradedAmount is now maxxed out, mapping will now underflow
        ERC20(vether1).transferFrom(msg.sender, burnAddress, _amount);                      // Must collect & burn tokens
        // must transfer to the user the 33k VETH
        _transfer(address(this), msg.sender, _amount);                                      // Send to owner
        // sends to attacker the 33k VETH
        return true;
    }

### So there are two bugs

    1) Use `_amount` instead of `amount`

if(mapPreviousOwnership[msg.sender] < amount){_amount = mapPreviousOwnership[msg.sender];} // Upgrade as much as possible
// should be:
if(mapPreviousOwnership[msg.sender] < _amount){_amount = mapPreviousOwnership[msg.sender];} // Upgrade as much as possible

// and
if(remainingAmount < amount){_amount = remainingAmount;}                            // Handle final amount
// should be:
if(remainingAmount < _amount){_amount = remainingAmount;}                            // Handle final amount


    2) Should have used SafeMath sub

upgradedAmount += _amount; mapPreviousOwnership[msg.sender] -= _amount;             // Update mappings
// should be:
upgradedAmount += _amount; mapPreviousOwnership[msg.sender].sub(_amount);             // Update mappings


### Max damage
// A previous owner can get the final amount not upgraded
