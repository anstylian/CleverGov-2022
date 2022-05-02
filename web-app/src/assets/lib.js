// Request Factory: 0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23
// Service1: 0xd6F62BD1e8008AF11FF95DF1aceF3F511A27cDb2
// Service2: 0x4C96C2e456778ed8d200C72Ed7E49D858B51bb00
// Service3: 0x550bD56960Cc52Fe8E0B10d0cf48BF2603E1C7F6
import { ethers } from "ethers";
import { requestFactoryAbi } from "./abis/RequestFactory.js";
import { requestAbi } from "./abis/Request.js";

export const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

export function createRequest() {
    // 
}

export function getRequestCreated(event) {
    let requestAddress;
    [requestAddress] = event.args;
    return { requestAddress }
}

export function getOpened(event, addType = false) {
    let owner, timestamp;
    [owner, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    let obj = { owner, timestamp }
    if (addType) {
        obj.type = "Opened"
    }
    return obj
}

export function getStateTransitionInitiated(event, addType = false) {
    let owner, currentHolder, newHolder, timestamp;
    [owner, currentHolder, newHolder, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    let obj = { owner, currentHolder, newHolder, timestamp }
    if (addType) {
        obj.type = "StateTransitionInitiated"
    }
    return obj
}

export function getStateTransitioned(event, addType = false) {
    let owner, currentHolder, newHolder, timestamp;
    [owner, currentHolder, newHolder, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    let obj = { owner, currentHolder, newHolder, timestamp }
    if (addType) {
        obj.type = "StateTransitioned"
    }
    return obj
}

export function getClosed(event, addType = false) {
    let owner, timestamp;
    [owner, timestamp] = event.args;
    timestamp = timestamp.toNumber()
    let obj = { owner, timestamp }
    if (addType) {
        obj.type = "Closed"
    }
    return obj
}


export async function getOpenedRequest(provider) {
    console.log(requestFactoryAbi);
    let requestFactory = new ethers.Contract("0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23", requestFactoryAbi, provider)
    // await requestFactory.openRequest(0, provider.getSigner(0))
    let requestCreatedFilter = requestFactory.filters.RequestCreated()
    let eventBlocks = await requestFactory.queryFilter(requestCreatedFilter)
    let events = eventBlocks.map((a) => getRequestCreated(a, true));
    // console.log(events);
    return events;
}

export async function getRequestStatus(provider, requestAddress) {
    let request = new ethers.Contract(requestAddress, requestAbi, provider)
    // await requestFactory.openRequest(0, provider.getSigner(0))
    // opened events
    let openedFilter = request.filters.Opened();
    let openedEventBlocks = await request.queryFilter(openedFilter);
    let openedEvents = openedEventBlocks.map((a) => getOpened(a, true));
    // console.log(events);
    // state transition initiated events
    let stateTransitionInitiatedFilter = request.filters.StateTransitionInitiated();
    let stateTransitionInitiatedEventBlocks = await request.queryFilter(stateTransitionInitiatedFilter);
    let stateTransitionInitiatedEvents = stateTransitionInitiatedEventBlocks.map((a) => getStateTransitionInitiated(a));

    // state transition accepted events
    let stateTransitionedFilter = request.filters.StateTransitioned();
    let stateTransitionedEventBlocks = await request.queryFilter(stateTransitionedFilter);
    let stateTransitionedEvents = stateTransitionedEventBlocks.map((a) => getStateTransitioned(a, true));

    // state transition accepted events
    let closedFilter = request.filters.Closed();
    let closedEventBlocks = await request.queryFilter(closedFilter);
    let closedEvents = closedEventBlocks.map((a) => getClosed(a, true));

    let all_events = []
    all_events = all_events.concat(openedEvents)
    all_events = all_events.concat(stateTransitionInitiatedEvents)
    all_events = all_events.concat(stateTransitionInitiatedEvents)
    all_events = all_events.concat(closedEvents)

    // all_events.sort(function(a,b) {return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0);} );

    return all_events;
}

export async function main() {
    // alert(1);
    // ethereum.enable().then(() => {
    //     web3 = new Web3(web3.currentProvider);
    // });
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Account:", await signer.getAddress());

    let openedRequests = await getOpenedRequest(provider)
    // console.log(openedRequests);
    // console.log(openedRequests[0]);
    console.log(await getRequestStatus(provider, openedRequests[0].requestAddress));
}

// export {
//     function1 as newFunctionName,
//     function2 as anotherNewFunctionName
// };
