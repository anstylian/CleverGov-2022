// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Request.sol";

contract RequestFactory {
    event RequestCreated(address requestAddress);

    mapping(address => address) public requests;

    function openRequest(Request.TYPE _rtype) public returns(address) {
        require(_rtype <= Request.TYPE.BIRTH_SUBSIDY, "Invalid Request Type");
        Request request = new Request(msg.sender, _rtype);
        emit RequestCreated(address(request));
        return address(request);
    }
}
