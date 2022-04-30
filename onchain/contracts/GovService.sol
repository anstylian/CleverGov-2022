// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Request.sol";

contract GovService is AccessControl {
    string public name;
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    constructor(address _owner, string memory _name) {
        name = _name;
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function transferRequest(address _requestAddress, address _newHolder)
        public
        onlyRole(SIGNER_ROLE)
    {
        Request request = Request(_requestAddress);
        request.initiateTransition(_newHolder);
    }

    function acceptRequest(address _requestAddress) public onlyRole(SIGNER_ROLE) {
        Request request = Request(_requestAddress);
        request.acceptTransition();
    }
}
