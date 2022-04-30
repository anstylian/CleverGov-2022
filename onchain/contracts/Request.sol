// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Request {
    enum TYPE {
        BIRTH_SUBSIDY
    }

    enum STATE {
        OPEN,
        IN_PROGRESS,
        CLOSED
    }

    address public owner;
    STATE public state;
    TYPE public rtype;
    address public currentHolder;
    uint256 public createdAt;
    uint256 public updateAt;

    address public pendingNewHolder;

    event Opened(address owner, uint256 timestamp);
    event StateTransitionInitiated(
        address owner,
        address currentHolder,
        address newHolder,
        uint256 timestamp
    );
    event StateTransitioned(
        address owner,
        address currentHolder,
        address newHolder,
        uint256 timestamp
    );
    event Closed(address owner, uint256 timestamp);

    constructor(address _owner, TYPE _rtype) {
        owner = _owner;
        rtype = _rtype;

        state = STATE.OPEN;
        currentHolder = _owner;
        createdAt = block.timestamp;
        updateAt = createdAt;

        emit Opened(owner, block.timestamp);
    }

    // TODO: add support for request dependencies
    // function addDependencies(address _owner) public {
    //     // split to sub requests
    // }

    function initiateTransition(address _newHolder) public {
        require(msg.sender == currentHolder, "Not current holder");
        pendingNewHolder = _newHolder;
        emit StateTransitioned(
            owner,
            currentHolder,
            pendingNewHolder,
            block.timestamp
        );
    }

    function acceptTransition() public {
        require(msg.sender == pendingNewHolder, "Not new holder");
        require(state != STATE.CLOSED, "Invalid state transition");
        address oldHolder = currentHolder;
        currentHolder = pendingNewHolder;
        pendingNewHolder = address(0);
        state = STATE.IN_PROGRESS;
        updateAt = block.timestamp;
        emit StateTransitioned(
            owner,
            oldHolder,
            currentHolder,
            block.timestamp
        );
    }

    // TODO: reject transtion
    // function rejectTransition() public {
    //     // reject transition functionality
    // }

    function closeRequest() public {
        require(msg.sender == owner, "Not request owner");
        require(msg.sender == currentHolder, "Not current holder");
        require(state != STATE.CLOSED, "Invalid state transition");
        state = STATE.CLOSED;
        updateAt = block.timestamp;
        emit Closed(owner, block.timestamp);
    }
}
