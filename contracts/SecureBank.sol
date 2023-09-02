// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {BankInterface} from "./BankInterface.sol";

contract SecureBank is BankInterface {
    mapping(address => uint256) private balances;

    function deposit() external payable {
        require(msg.value >= 1 ether, "Bank: minimum deposit is 1 ether");
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 _balance = balances[msg.sender];
        require(_balance >= 1 ether, "Bank: insufficient funds");
        balances[msg.sender] = 0; // Set callers balance to zero before sending the funds to the caller.
        (bool sent, ) = payable(msg.sender).call{value: _balance}("");
        require(sent, "Bank: failed to send funds");
    }

    function getBankBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
