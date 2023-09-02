const hh = require("hardhat");
const { ethers } = hh;
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    async function deployContracts(bank) {
        const accounts = await ethers.getSigners();
        const signer = accounts[0];
        const bankFactory = await ethers.getContractFactory(bank, signer);
        const bankContract = await bankFactory.deploy();
        await bankContract.waitForDeployment();
        const exploiterFactory = await ethers.getContractFactory("Exploiter", signer);
        const exploiterContract = await exploiterFactory.deploy(bankContract.target);
        await exploiterContract.waitForDeployment();

        return { bankContract, exploiterContract, accounts };
    }

    async function deployVulnerableContractFixture() {
        return await deployContracts("VulnerableBank");
    }

    async function deploySecureContractFixture() {
        return await deployContracts("SecureBank");
    }

    async function deployBetterSecureContractFixture() {
        return await deployContracts("BetterSecureBank");
    }

    describe("VulnerableBank", async function () {
        it("Should drain all the ether from the Bank contract", async function () {
            const { bankContract, exploiterContract, accounts } = await loadFixture(deployVulnerableContractFixture);

            await (async function () {
                const tx = await bankContract.deposit({ value: ethers.parseEther("5") });
                await tx.wait();
            })();

            await (async function () {
                const tx = await exploiterContract.launchExploit({ value: ethers.parseEther("1") });
                await tx.wait();
            })();

            expect(await bankContract.getContractBalance()).to.equal(0);
            expect(await exploiterContract.getContractBalance()).to.equal(ethers.parseEther("6"));
        });
    });

    describe("SecureBank", async function () {
        it("Should revert with correct message when the Exploiter contract attempts to drain the ether from the Bank contract", async function () {
            const { bankContract, exploiterContract, accounts } = await loadFixture(deploySecureContractFixture);

            await (async function () {
                const tx = await bankContract.deposit({ value: ethers.parseEther("5") });
                await tx.wait();
            })();

            await expect(exploiterContract.launchExploit({ value: ethers.parseEther("1") })).to.be.revertedWith("Bank: failed to send funds");
        });
    });

    describe("BetterSecureBank", async function () {
        it("Should revert with correct message when the Exploiter contract attempts to drain the ether from the Bank contract", async function () {
            const { bankContract, exploiterContract, accounts } = await loadFixture(deployBetterSecureContractFixture);

            await (async function () {
                const tx = await bankContract.deposit({ value: ethers.parseEther("5") });
                await tx.wait();
            })();

            await expect(exploiterContract.launchExploit({ value: ethers.parseEther("1") })).to.be.revertedWith("Bank: failed to send funds");
        });
    });
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
});