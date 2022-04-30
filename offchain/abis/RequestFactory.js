requestFactoryAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "requestAddress",
                "type": "address"
            }
        ],
        "name": "RequestCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "enum Request.TYPE",
                "name": "_rtype",
                "type": "uint8"
            }
        ],
        "name": "openRequest",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "requests",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
