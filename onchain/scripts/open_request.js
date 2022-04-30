const hre = require("hardhat");
const { ethers } = require("hardhat");

// Request Factory: 0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23
// Service1: 0xd6F62BD1e8008AF11FF95DF1aceF3F511A27cDb2
// Service2: 0x4C96C2e456778ed8d200C72Ed7E49D858B51bb00
// Service3: 0x550bD56960Cc52Fe8E0B10d0cf48BF2603E1C7F6


function getRequestCreated(event) {
    [requestAddress] = event.args;
    return { requestAddress }
}

async function main() {

    const [
        owner,
        service1Owner,
        service1Signer1,
        service1Signer2,
        service2Owner,
        service2Signer1,
        service3Owner,
        service3Signer1,
        requester,
    ] = await ethers.getSigners();

    const RequestFactory = await ethers.getContractFactory("RequestFactory");
    const GovService = await ethers.getContractFactory("GovService");
    const Request = await ethers.getContractFactory("Request");

    // get request factory
    requestFactory = await RequestFactory.attach("0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23");

    // get government services
    service1 = await GovService.attach("0xd6F62BD1e8008AF11FF95DF1aceF3F511A27cDb2");
    service2 = await GovService.attach("0x4C96C2e456778ed8d200C72Ed7E49D858B51bb00");
    service3 = await GovService.attach("0x550bD56960Cc52Fe8E0B10d0cf48BF2603E1C7F6");

    RequestType = {
        BIRTH_SUBSIDY: 0
    }

    // initiate a request
    tx = await requestFactory.connect(requester).openRequest(RequestType.BIRTH_SUBSIDY);
    receipt = await tx.wait();
    creationEvent = getRequestCreated(receipt.events.find(event => event.event === 'RequestCreated'));
    // console.log(receipt.events)

    // get the created request
    request = Request.attach(creationEvent.requestAddress);

    console.log(creationEvent.requestAddress);
    console.log(request);
    console.log("Done");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
