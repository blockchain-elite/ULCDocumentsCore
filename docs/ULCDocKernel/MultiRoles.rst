Multi-Owner and Multi-Operator ability
======================================
For most of important organization, only one person can't do dangerous actions alone, such as signing an official document. In this way, the kernel has the ability to wait for multiple **confirmations** before doing important stuff, like publishing a signature, or changing critical configuration parameters.


Roles
-----

ULCDocKernel has 2 floors of administrative process :

* ``owners`` that are administrators of the Smart Contract. They can change sensible parameters.
* ``operators`` that can only push, confirm and revoke signatures.

.. note::
  Owners have operators rights

In order to do something on the Smart Contract, like **signing** or **changing parameters**, you need to call every time a **requester** that will record you request and do it if it reaches ``operatorsForChange`` and respectively ``ownersForChange``  request count.

.. warning::
  An account can't be ``owner`` and ``operator`` at the same time.

By default, ULCDocKernel is configurated to work with one owner account. So, is you use the kernel with only one owner, the request part is totally transparent and your requests are done immediately.


How the requester works
-----------------------

When you want to do an action, all requesters will create a ``keccak256`` hash of the request and store it inside a mapping.

::

  mapping(bytes32 => address[]) public doOwnerRequest;
  mapping(bytes32 => address[]) public doOperatorRequest;

Then, each address who request the same thing will be added into an array and when it's length reaches ``operatorsForChange`` or ``ownersForChange``, the action requested is done.

Constructor
-----------

::

  constructor() public {
      owners[msg.sender] = true;
      ownerCount = 1;
      ownersForChange = 1;
      operatorsForChange = 1;
  }

By default, the creator of the smart contract is the owner and everything is configurated to work with only one confirmation.

Variables available
-------------------

::

  uint256 public ownerCount;
  uint256 public ownersForChange;

  uint256 public operatorCount;
  uint256 public operatorsForChange;

  mapping (address => bool) public owners;
  mapping(bytes32 => address[]) public doOwnerRequest;

  mapping (address => bool) public operators;
  mapping(bytes32 => address[]) public doOperatorRequest;

  event OwnershipNewInteractor(address indexed newOwner);

  event OwnershipLossInteractor(address indexed oldOwner);

  event OwnershipTransferred(
      address indexed previousOwner,
      address indexed newOwner
  );

  event OperatorNewInteractor(address indexed newOperator);

  event OperatorLossInteractor(address indexed oldOperator);

  event OperatorshipTransferred(
      address indexed previousOperator,
      address indexed newOperator
  );

Functions available
-------------------

Basic setters
^^^^^^^^^^^^^
::
  //Both need enough confirmation (they are requester too)
  function  setOperatorsForChange(uint256 _nb) external onlyOwner {
  }

  function setOwnersForChange(uint256 _nb) external onlyOwner {
  }

Requester
^^^^^^^^^
::

  function requestAddOwner(address _newOwner) external onlyOwner{
  }

  function requestAddOperator(address _newOperator) external onlyOwner {
  }

  function requestChangeOwner(address _oldOwner, address _newOwner) external onlyOwner{
  }

  function requestRemoveOwner(address _removableOwner) external onlyOwner{
  }

  function requestRemoveOperator(address _removableOperator) external onlyOwner{
  }

.. info::
  Don't forget to update ``ownersForChange`` or ``operatorsForChange`` if you want to modify number of confirmations before doing an action.

Getters
^^^^^^^
::

  //Returns all adresses who approved the keccak256 operator request
  function getOperatorRequest(bytes32 _theKey) external view returns(address[] memory) {
  }

  //Returns numbers of operators who confirmed the keccak256 request.
  function getOperatorRequestLength(bytes32 _theKey) external view returns(uint256) {
  }

  //Returns all adresses who approved the keccak256 owner request
  function getOwnerRequest(bytes32 _theKey) external view returns(address[] memory) {
  }

  //Returns numbers of owners who confirmed the keccak256 request.
  function getOwnerRequestLength(bytes32 _theKey) external view returns(uint256) {
  }
