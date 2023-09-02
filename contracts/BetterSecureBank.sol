// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {BankInterface} from "./BankInterface.sol";

contract BetterSecureBank is BankInterface {
    mapping(address => uint256) private balances;
    bool private locked;

    function deposit() external payable {
        require(msg.value >= 1 ether, "Bank: minimum deposit is 1 ether");
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        require(!locked, "Bank: contract is locked");
        locked = true;
        uint256 _balance = balances[msg.sender];
        require(_balance >= 1 ether, "Bank: insufficient funds");
        (bool sent, ) = payable(msg.sender).call{value: _balance}("");
        require(sent, "Bank: failed to send funds");
        balances[msg.sender] = 0;
        locked = false;
    }

    function getBankBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
