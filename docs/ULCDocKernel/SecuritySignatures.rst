Security about signatures
=========================

Requirements
----------

ULCDocument is designed to resist **minority key stealing** attacks, as long as you meet those requirements:

* Attacker must have **less than** ``ownersForChange`` **and** ``operatorsForChange`` keys stolen
* You must have at least ``ownersForChange`` keys available

.. info::
    We recommend you to have ``ownersForChange`` number of recovery *owner accounts* in cold storage and store all your accounts configurated at different physical servers, and if possible in a different network.

.. warning::
    If you are an organisation, do not give all your *owner accounts* to the same person!

Recovery
-----------------

Clean Compromised Accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^

First remove all compromised ``owners`` and ``operators`` using associated functions (see :ref:`MultiRoles <MultiRoles>` section).

Then, you need to have at least ``operatorsForChange`` available accounts.

Clean Requests
^^^^^^^^^^^^^^

If an attacker started to sign documents (but can't confirm it, as he does't have enough accounts), then you need to clear it by using the ``clearDocument`` function below:

::

    function clearDocument(bytes32 _SignatureHash) external atLeastOperator notUpgraded whenNotPaused {}

.. note::
    You can't clear a document if it has already been signed or revoked.

If an attacker started to revoke documents you can also clear the request (and delete possible ``revoked_reason`` added with it) using the function below:

::

    function clearRevokeProcess(bytes32 _SignatureHash) external atLeastOperator notUpgraded whenNotPaused {}

.. note::
    You can't clear a document revoke request if it has already revoked.

If an attacker started to request a selfdestruct, you can clear the requester counter using the function below:

::

    //note : only a compromised owner account can request kill().
    function clearKill() external onlyOwner {}

Contest Other Operations
^^^^^^^^^^^^^^^^^^^^^^^^

Owners can also use a *lower level* of cleaning by reseting every request that they want.

::

    /**
    * @dev Delete the request queue for that action. Used to save gaz if there is a lot of owners or
    for security purposes, to reset the action agreed counter.
    */
    function requestOwnerContest(bytes32 _doRequestContest) external onlyOwner {}

    function requestOperatorContest(bytes32 _doRequestContest) external atLeastOperator {}

.. note::
    To reset a counter, you first need to know which request has been created by the attacker. Then you need to calculate the ``bytes32`` hash of the request and call *contester functions*
