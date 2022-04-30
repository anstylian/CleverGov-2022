// Request Factory: 0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23
// Service1: 0xd6F62BD1e8008AF11FF95DF1aceF3F511A27cDb2
// Service2: 0x4C96C2e456778ed8d200C72Ed7E49D858B51bb00
// Service3: 0x550bD56960Cc52Fe8E0B10d0cf48BF2603E1C7F6


function createRequest () {
    // 
}

function getRequestCreated(event) {
    [requestAddress] = event.args;
    return { requestAddress }
}

function getOpened(event, addType=false) {
    [owner, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    obj = { owner, timestamp }
    if (addType) {
        obj.type = "Opened"
    }
    return obj
}

function getStateTransitionInitiated(event, addType=false) {
    [owner, currentHolder, newHolder, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    obj = { owner, currentHolder, newHolder, timestamp }
    if (addType) {
        obj.type = "StateTransitionInitiated"
    }
    return obj
}

function getStateTransitioned(event, addType=false) {
    [owner, currentHolder, newHolder, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    obj = { owner, currentHolder, newHolder, timestamp }
    if (addType) {
        obj.type = "StateTransitioned"
    }
    return obj
}

function getClosed(event, addType=false) {
    [owner, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    obj = { owner, timestamp }
    if (addType) {
        obj.type = "Closed"
    }
    return obj
}


async function getOpenedRequest(provider) {
    requestFactory = new ethers.Contract("0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23", requestFactoryAbi, provider)
    // await requestFactory.openRequest(0, provider.getSigner(0))
    requestCreatedFilter = requestFactory.filters.RequestCreated()
    eventBlocks = await requestFactory.queryFilter(requestCreatedFilter)
    events = eventBlocks.map((a) => getRequestCreated(a, true));
    // console.log(events);
    return events;
}

async function getRequestStatus(provider, requestAddress) {
    request = new ethers.Contract(requestAddress, requestAbi, provider)
    // await requestFactory.openRequest(0, provider.getSigner(0))
    // opened events
    openedFilter = request.filters.Opened();
    openedEventBlocks = await request.queryFilter(openedFilter);
    openedEvents = openedEventBlocks.map((a) => getOpened(a, true));
    // console.log(events);
    // state transition initiated events
    stateTransitionInitiatedFilter = request.filters.StateTransitionInitiated();
    stateTransitionInitiatedEventBlocks = await request.queryFilter(stateTransitionInitiatedFilter);
    stateTransitionInitiatedEvents = stateTransitionInitiatedEventBlocks.map((a) => getStateTransitionInitiated(a));
    
    // state transition accepted events
    stateTransitionedFilter = request.filters.StateTransitioned();
    stateTransitionedEventBlocks = await request.queryFilter(stateTransitionedFilter);
    stateTransitionedEvents = stateTransitionedEventBlocks.map((a) => getStateTransitioned(a, true));

    // state transition accepted events
    closedFilter = request.filters.Closed();
    closedEventBlocks = await request.queryFilter(closedFilter);
    closedEvents = closedEventBlocks.map((a) => getClosed(a, true));

    all_events = []
    all_events = all_events.concat(openedEvents)
    all_events = all_events.concat(stateTransitionInitiatedEvents)
    all_events = all_events.concat(stateTransitionInitiatedEvents)
    all_events = all_events.concat(closedEvents)

    // all_events.sort(function(a,b) {return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0);} );

    return all_events;
}

async function main() {
    // alert(1);
    // ethereum.enable().then(() => {
    //     web3 = new Web3(web3.currentProvider);
    // });
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Account:", await signer.getAddress());

    openedRequests = await getOpenedRequest(provider)
    // console.log(openedRequests);
    // console.log(openedRequests[0]);
    console.log(await getRequestStatus(provider, openedRequests[0].requestAddress));
}
