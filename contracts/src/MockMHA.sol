// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockMHA
 * @dev ERC20-like mock token for M Hash L2 Testnet demo purposes only.
 *      NOT for production use. For testnet-stage developer demonstrations.
 */
contract MockMHA {
    string public constant name = "Mock MHA";
    string public constant symbol = "mMHA";
    uint8 public constant decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        _totalSupply = INITIAL_SUPPLY;
        // 80% to deployer, 20% reserved for faucet
        uint256 faucetAllocation = INITIAL_SUPPLY * 20 / 100;
        _balances[msg.sender] = INITIAL_SUPPLY - faucetAllocation;
        _balances[address(this)] = faucetAllocation;
        emit Transfer(address(0), msg.sender, INITIAL_SUPPLY - faucetAllocation);
        emit Transfer(address(0), address(this), faucetAllocation);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        _transfer(from, to, amount);
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "MockMHA: insufficient allowance");
        _approve(from, msg.sender, currentAllowance - amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "MockMHA: transfer from zero");
        require(to != address(0), "MockMHA: transfer to zero");
        require(_balances[from] >= amount, "MockMHA: insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "MockMHA: approve from zero");
        require(spender != address(0), "MockMHA: approve to zero");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    // Faucet function for testnet demo
    function faucet(address to, uint256 amount) external {
        require(_balances[address(this)] >= amount, "MockMHA: insufficient faucet balance");
        _transfer(address(this), to, amount);
    }
}
