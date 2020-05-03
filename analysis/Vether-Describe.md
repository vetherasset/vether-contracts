```bash
+ [Int] ERC20 
    - [Ext] totalSupply
    - [Ext] balanceOf
    - [Ext] transfer #
    - [Ext] allowance
    - [Ext] approve #
    - [Ext] transferFrom #

 + [Int] UniswapFactory 
    - [Ext] getExchange

 + [Int] UniswapExchange 
    - [Ext] tokenToEthTransferInput #

 +  Vether (ERC20)
    - [Pub] <Constructor> #
    - [Pub] transfer #
    - [Pub] approve #
    - [Pub] transferFrom #
    - [Prv] _transfer #
    - [Prv] _getFee
    - [Ext] <Fallback> ($)
    - [Ext] burnEtherForMember ($)
    - [Ext] burnTokens #
    - [Ext] burnTokensForMember #
    - [Prv] _burnTokens #
    - [Pub] getExchange
    - [Prv] _recordBurn #
    - [Ext] addRegistry #
    - [Ext] addExcluded #
    - [Pub] addRegistryInternal #
    - [Pub] getDaysContributedForEra
    - [Ext] withdrawShare #
    - [Ext] withdrawShareForMember #
    - [Prv] _withdrawShare #
    - [Prv] _processWithdrawal #
    - [Pub] getEmissionShare
    - [Prv] _updateEmission #
    - [Pub] getNextEraEmission
    - [Pub] getDayEmission


 ($) = payable function
 # = non-constant function
 ```