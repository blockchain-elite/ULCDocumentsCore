Security about signatures
=========================

Conditions
----------

ULCDocument is designed to resist in an attack with **minority key stealing.** That mean you need to have these conditions :

* Attacker has **less than** ``ownersForChange`` **and** ``operatorsForChange`` keys stolen
* You have at least ``ownersForChange`` keys available

.. info::
    We recommand you to have ``ownersForChange`` number of recovery *owner accounts* in cold storage and store all your accounts configurated at different physical servers, and if possible in a different network.

.. warning::
    If you are an organisation, don't give all *owner accounts* to the same person !

Possible recovery
-----------------

Clean compromised accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^

First remove all compromised ``owners`` and ``operators`` with associated functions (see :ref:`**MultiRoles <MultiRoles>**`).

You need now to have ``operatorsForChange`` available accounts.

Clean requests
^^^^^^^^^^^^^^

If attacker started to sign documents (but can't confirm it as he does't have enough accounts), then you need to clear it by using ``clearDocument`` function.

::

    function clearRevokeProcess(bytes32 _SignatureHash) external atLeastOperator notUpgraded whenNotPaused {}

.. note::
    You can't clear a document if it is already signed or revoked.

If attacker started to revoke documents you can also clear the request (and delete possible ``revoked_reason`` added)

::

    function clearRevokeProcess(bytes32 _SignatureHash) external atLeastOperator notUpgraded whenNotPaused {}

.. note::
    You can't clear a document revoke if it is already revoked.

If attacker started to request a selfdestruct, you can clear the requester counter :

::
    
    //note : only a compromised owner account can request kill().
    function clearKill() external onlyOwner {}

Contest other operations
^^^^^^^^^^^^^^^^^^^^^^^^

Owners can also use a *lower level* of cleaning by reseting every requests that they want.

::

    /**
    * @dev Delete the request queue for that action. Used to save gaz if there is a lot of owners or
    in security purpose to reset the action agreed counter.
    */
    function requestOwnerContest(bytes32 _doRequestContest) external onlyOwner {}

    function requestOperatorContest(bytes32 _doRequestContest) external atLeastOperator {}

.. note::
    To reset a counter, you first need to know which requests has been created by attacker. Then you need to calculate ``bytes32`` hash of the request and call *contester functions*
