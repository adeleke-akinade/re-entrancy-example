const hh = require("hardhat");
const { ethers } = hh;
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    async function deployVulnerableContractFixture() {
        const accounts = await ethers.getSigners();
        const signer = accounts[0];
        const bankFactory = await ethers.getContractFactory("VulnerableBank", signer);
        const bankContract = await bankFactory.deploy();
        await bankContract.waitForDeployment();
        const exploiterFactory = await ethers.getContractFactory("Exploiter", signer);
        const exploiterContract = await exploiterFactory.deploy(bankContract.target);
        await exploiterContract.waitForDeployment();

        return { bankContract, exploiterContract, accounts };
    }

    describe("VulnerableBank", async function () {
        it("Should withdraw all the funds to the exploiter contract", async function () {
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
}

main().catch((error) => {
    console.log(error);
    process.exit(1);
});