const { expect } = require("chai");
const { ethers } = require("hardhat");

function getRequestCreated(event) {
    [requestAddress] = event.args;
    return { requestAddress }
}

function getOpened(event) {
    [owner, timestamp] = event.args;
    return { owner, timestamp }
}

function getStateTransitionInitiated(event) {
    [owner, currentHolder, newHolder, timestamp] = event.args;
    return { owner, currentHolder, newHolder, timestamp }
}

function getStateTransitioned(event) {
    [owner, currentHolder, newHolder, timestamp] = event.args;
    return { owner, currentHolder, newHolder, timestamp }
}

function getClosed(event) {
    [owner, timestamp] = event.args;
    return { owner, timestamp }
}


describe("Full Flow", function () {
    //   it("Deployment should assign the total supply of tokens to the owner", async function () {
    //     const [owner] = await ethers.getSigners();

    //     const Token = await ethers.getContractFactory("Token");

    //     const hardhatToken = await Token.deploy();

    //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
    //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    //   });
    it("ABC", async function () {
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

        // deploy request factory
        requestFactory = await RequestFactory.deploy();

        // deploy government services
        service1 = await GovService.deploy(service1Owner.address, "Service1");
        service2 = await GovService.deploy(service2Owner.address, "Service2");
        service3 = await GovService.deploy(service3Owner.address, "Service3");

        // add signers to government services
        tx = await service1.connect(service1Owner).grantRole(await service1.SIGNER_ROLE(), service1Signer1.address);
        await tx.wait();
        await service1.connect(service1Owner).grantRole(await service1.SIGNER_ROLE(), service1Signer2.address);
        await tx.wait();
        await service2.connect(service2Owner).grantRole(await service2.SIGNER_ROLE(), service2Signer1.address);
        await tx.wait();
        await service3.connect(service3Owner).grantRole(await service3.SIGNER_ROLE(), service3Signer1.address);
        await tx.wait();

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

        // request owner should be the same as the request opener
        expect(await request.owner()).to.equal(requester.address);
        expect(await request.rtype()).to.equal(RequestType.BIRTH_SUBSIDY);

        // openedEvent = getOpened(receipt.events[0]);
        // expect(await openedEvent.owner()).to.equal(requester.address);

        // accept transfer from owner to service 1
        tx = await request.connect(requester).initiateTransition(service1.address);
        receipt = await tx.wait();
        // stateTransitionInitiated = getStateTransitionInitiated(receipt.events.find(event => event.event === 'StateTransitionInitiated'));
        // expect(await stateTransitionInitiated.owner()).to.equal(requester.address);
        // expect(await stateTransitionInitiated.currentHolder()).to.equal(requester.address);
        // expect(await stateTransitionInitiated.newHolder()).to.equal(service1.address);

        tx = await service1.connect(service1Signer1).acceptRequest(request.address);
        receipt = await tx.wait();

        // transfer from service 1 to service 2
        tx = await service1.connect(service1Signer1).transferRequest(request.address, service2.address);
        receipt = await tx.wait();
        tx = await service2.connect(service2Signer1).acceptRequest(request.address);
        receipt = await tx.wait();

        // transfer from service 2 to service 3
        tx = await service2.connect(service2Signer1).transferRequest(request.address, service3.address);
        receipt = await tx.wait();
        tx = await service3.connect(service3Signer1).acceptRequest(request.address);
        receipt = await tx.wait();

        // transfer from service 3 to service 2
        tx = await service3.connect(service3Signer1).transferRequest(request.address, service2.address);
        receipt = await tx.wait();
        tx = await service2.connect(service2Signer1).acceptRequest(request.address);
        receipt = await tx.wait();

        // transfer from service 2 to service 1
        tx = await service2.connect(service2Signer1).transferRequest(request.address, service1.address);
        receipt = await tx.wait();
        tx = await service1.connect(service1Signer1).acceptRequest(request.address);
        receipt = await tx.wait();

        // transfer from service 1 to owner
        tx = await service1.connect(service1Signer1).transferRequest(request.address, requester.address);
        receipt = await tx.wait();
        tx = await request.connect(requester).acceptTransition();
        receipt = await tx.wait();

        // close request
        tx = await request.connect(requester).closeRequest();
        receipt = await tx.wait();

    });
});
