// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AITaskReceipt
 * @dev Records AI task payment receipts on-chain.
 *      Designed to support x402-compatible payment flows on M Hash L2.
 *      Subject to technical validation. Not production-ready.
 */
contract AITaskReceipt {
    struct Receipt {
        string taskId;
        address user;
        address provider;
        address agent;
        string serviceType;
        uint256 amount;
        address token;
        bytes32 paymentTxHash;
        bytes32 resultHash;
        string metadataURI;
        uint256 timestamp;
    }

    mapping(bytes32 => Receipt) public receipts;
    mapping(address => bytes32[]) public userReceipts;

    event AITaskReceiptCreated(
        bytes32 indexed receiptId,
        string taskId,
        address indexed user,
        address provider,
        address agent,
        string serviceType,
        uint256 amount,
        address token,
        bytes32 paymentTxHash,
        bytes32 resultHash,
        string metadataURI,
        uint256 timestamp
    );

    /**
     * @dev Creates a new AI task receipt.
     * @param _taskId Unique task identifier
     * @param _user User address
     * @param _provider Service provider address
     * @param _agent AI agent address
     * @param _serviceType Type of AI service (e.g., "text-generation", "image-analysis")
     * @param _amount Payment amount
     * @param _token Payment token address
     * @param _paymentTxHash Payment transaction hash
     * @param _resultHash Hash of the AI task result
     * @param _metadataURI URI pointing to off-chain metadata
     * @return receiptId Unique identifier for this receipt
     */
    function createReceipt(
        string memory _taskId,
        address _user,
        address _provider,
        address _agent,
        string memory _serviceType,
        uint256 _amount,
        address _token,
        bytes32 _paymentTxHash,
        bytes32 _resultHash,
        string memory _metadataURI
    ) external returns (bytes32 receiptId) {
        receiptId = keccak256(
            abi.encodePacked(_taskId, _user, block.timestamp)
        );

        Receipt storage receipt = receipts[receiptId];
        receipt.taskId = _taskId;
        receipt.user = _user;
        receipt.provider = _provider;
        receipt.agent = _agent;
        receipt.serviceType = _serviceType;
        receipt.amount = _amount;
        receipt.token = _token;
        receipt.paymentTxHash = _paymentTxHash;
        receipt.resultHash = _resultHash;
        receipt.metadataURI = _metadataURI;
        receipt.timestamp = block.timestamp;

        userReceipts[_user].push(receiptId);

        emit AITaskReceiptCreated(
            receiptId,
            _taskId,
            _user,
            _provider,
            _agent,
            _serviceType,
            _amount,
            _token,
            _paymentTxHash,
            _resultHash,
            _metadataURI,
            block.timestamp
        );
    }

    function getReceipt(bytes32 _receiptId) external view returns (Receipt memory) {
        return receipts[_receiptId];
    }

    function getUserReceiptCount(address _user) external view returns (uint256) {
        return userReceipts[_user].length;
    }

    function getUserReceipts(address _user, uint256 _offset, uint256 _limit) 
        external view returns (bytes32[] memory) 
    {
        uint256 total = userReceipts[_user].length;
        uint256 size = _limit > total - _offset ? total - _offset : _limit;
        bytes32[] memory result = new bytes32[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = userReceipts[_user][_offset + i];
        }
        return result;
    }
}
