## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/Vether.sol | 72816a44dc0ca1d8c050352efed1c5453d828ec5 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **ERC20** | Interface |  |||
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
||||||
| **UniswapFactory** | Interface |  |||
| └ | getExchange | External ❗️ |   |NO❗️ |
||||||
| **UniswapExchange** | Interface |  |||
| └ | tokenToEthTransferInput | External ❗️ | 🛑  |NO❗️ |
||||||
| **Vether** | Implementation | ERC20 |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | transfer | Public ❗️ | 🛑  |NO❗️ |
| └ | approve | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | Public ❗️ | 🛑  |NO❗️ |
| └ | _transfer | Internal 🔒 | 🛑  | |
| └ | _getFee | Private 🔐 |   | |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | burnEtherForMember | External ❗️ |  💵 |NO❗️ |
| └ | burnTokens | External ❗️ | 🛑  |NO❗️ |
| └ | burnTokensForMember | External ❗️ | 🛑  |NO❗️ |
| └ | _burnTokens | Internal 🔒 | 🛑  | |
| └ | getExchange | Public ❗️ |   |NO❗️ |
| └ | _recordBurn | Internal 🔒 | 🛑  | |
| └ | addRegistry | External ❗️ | 🛑  |NO❗️ |
| └ | addRegistryInternal | Public ❗️ | 🛑  |NO❗️ |
| └ | getDaysContributedForEra | Public ❗️ |   |NO❗️ |
| └ | withdrawShare | External ❗️ | 🛑  |NO❗️ |
| └ | withdrawShareForMember | External ❗️ | 🛑  |NO❗️ |
| └ | _withdrawShare | Private 🔐 | 🛑  | |
| └ | _processWithdrawal | Private 🔐 | 🛑  | |
| └ | getEmissionShare | Public ❗️ |   |NO❗️ |
| └ | _updateEmission | Private 🔐 | 🛑  | |
| └ | getNextEraEmission | Public ❗️ |   |NO❗️ |
| └ | getDayEmission | Public ❗️ |   |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
