Multi-Owner and Multi-Operator ability
======================================
For most organization, one person cannot do dangerous actions alone, such as signing official documents. As such, the kernel has the ability to wait for multiple **confirmations** before doing anything, like publishing a signature, or changing critical configuration parameters.


Roles
-----

ULCDocKernel has 2 levels of administrative rights:

* ``operators`` can only push, confirm and revoke signatures.
* ``owners`` are administrators of the Smart Contract. In addition to having operator's rights, they can also change sensible parameters.


In order to do something on the Smart Contract, like **signing** or **changing parameters**, you need to call a **requester**. This requester will record you request and only process it if it reaches ``operatorsForChange`` (respectively ``ownersForChange``) request count.

.. warning::
  An account can't be ``owner`` and ``operator`` at the same time.

By default, ULCDocKernel is configurated to work with only one owner account (and no operators). If you use the kernel with only one owner, all your requests will be done immediately (as ``ownersForChange`` will be set to 1);.


Requester
-----------------------

When you want to do an action, requesters will create a ``keccak256`` hash of the request and store it inside a mapping.

::

  mapping(bytes32 => address[]) public doOwnerRequest;
  mapping(bytes32 => address[]) public doOperatorRequest;

Then, each time an address requests the same action, it will be added into an array. The action will be processed only when the array's length reaches the value ``operatorsForChange`` or ``ownersForChange``.

Constructor
-----------

By default, the creator of the smart contract is the owner, and everything is configurated to work with only one confirmation, as explained above.

::

  constructor() public {
      owners[msg.sender] = true;
      ownerCount = 1;
      ownersForChange = 1;
      operatorsForChange = 1;
  }



Variables
-------------------

Bellow are the variables used by the smart contract for operator management:

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

Functions
-------------------

The ULCDocKernel smart contract lets you use different functions to interact with it, detailled bellow:

Setters (Requesters)
^^^^^^^^^^^^^

These functions allow you to manage owners and operators for this kernel. Keep in mind these behave like requesters, and as such need enough confirmations to work.

::

  // Set the number of operators needed for confirmation
  function setOperatorsForChange(uint256 _nb) external onlyOwner {}

  // Set the number of owners needed for confirmation
  function setOwnersForChange(uint256 _nb) external onlyOwner {}

  // Add a new kernel owner
  function requestAddOwner(address _newOwner) external onlyOwner{}

  // Add a new kernel operator
  function requestAddOperator(address _newOperator) external onlyOwner {}

  // Transfer kernel's ownership
  function requestChangeOwner(address _oldOwner, address _newOwner) external onlyOwner{}

  // Remove a kernel owner
  function requestRemoveOwner(address _removableOwner) external onlyOwner{}

  // Remove a kernel operator
  function requestRemoveOperator(address _removableOperator) external onlyOwner{}


.. info::
  Do not forget to update ``ownersForChange`` or ``operatorsForChange`` if you want to modify the number of confirmations before doing an action.


Getters
^^^^^^^

These functions allow you to get information on the kernel. As these are not requesters, you do not need to have enough confirmations to use them.

::

  //Returns all adresses who approved the keccak256 operator request
  function getOperatorRequest(bytes32 _theKey) external view returns(address[] memory) {}

  //Returns numbers of operators who confirmed the keccak256 request.
  function getOperatorRequestLength(bytes32 _theKey) external view returns(uint256) {}

  //Returns all adresses who approved the keccak256 owner request
  function getOwnerRequest(bytes32 _theKey) external view returns(address[] memory) {}

  //Returns the number of owners who confirmed the keccak256 request.
  function getOwnerRequestLength(bytes32 _theKey) external view returns(uint256) {}
