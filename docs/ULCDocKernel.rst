ULCDocKernel
====================

Summary
-------

Each organisation or individual has to publish his own *ULCDocKernel* smart contract. The kernel part is used to explicitly publish signatures to blockchain.
So, the owner of ULCDocKernel has a complete and independent way to certify documents.

The kernel has different features :

* Multi-Owner ability
* Native timestamp tracking
* *Undestroyable* signatures

General specification
=====================

Multi-Owner and Multi-Operator ability
--------------------------------------
For most of important organization, only one person can't do dangerous actions alone, such as signing an official document. In this way, the kernel has the ability to wait for multiple **confirmations** before doing important stuff, like publishing a signature, or changing critical configuration parameters.

Roles
^^^^^

ULCDocKernel has 2 floors of administrative process :

* ``owners`` that are administrators of the Smart Contract. They can change configuration parameters.
* ``operators`` that can only push, confirm and revoke signatures.

.. note::
  Owners have operators rights

In order to do something on the Smart Contract, like **signing** or **changing parameters**, you need to call every time a **requester** that will record you request and do it if it reaches ``operatorsForChange`` and respectively ``ownersForChange``  request count.

.. warning::
  An account can't be ``owner`` and ``operator`` at the same time.

By default, ULCDocKernel is configurated to work with one owner account. So, all the request part is totally transparent and your requests are done immediately.

How signatures are stored
-------------------------

Signature Structure
^^^^^^^^^^^^^^^^^^^

ULCDocKernel has a struct called ``Document`` which has all information about a signed document.

In order to officially sign a document, you have at least two steps :

1. Push a *document struct* into a mapping
2. Confirm the *document struct* with at least ``operatorsForChange`` number of ``operators``.

.. note::
  When you push a document into your Kernel, you automatically confirm it. So, if you use a simple signature Kernel, your document is signed with only one transaction.

::
    
    pragma solidity >=0.5.2 <0.6.0;

    contract ULCDocKernel {
        struct Document {
              bool initialized;
              bool signed;
              bool revoked;

              uint256 signed_date;
              uint256 revoked_date;
              uint16 document_family;

              string revoked_reason;
              string source;
              string extra_data;
        }
    }

By default, the EVM makes all var set to ``false``, ``0``, or ``""``.

* ``initialized`` is set to ``true`` as soon as someone started to try signing a document. When it is activated, you can't push an another version of the document. It's a security to prevent **deleting**, **cheating** about the fact that you sign some extra data, document family and so on.

.. info::
  As long as the document is not yet **signed**, you can request to **clean document state** and it will reset the document.

* ``signed`` is set to ``true`` as long as the document has enough confirmations. **It's the only field you need to trust to know if something has been signed or not.**
* ``revoked`` is set to ``true`` as long as the document has enough revoke request from operators.

.. info::
  revoke a signature do not delete signed state. It is just an additional information.

* ``signed_date`` is the UNIX timestamp (result of ``block.timestamp`` in solidity) of the block where signature has been officially signed.
* ``revoked_date`` is the UNIX timestamp (result of ``block.timestamp`` in solidity) of the block where revoked state has been officially declared.
* ``document_family`` is the index of the array where is stored the string value.
* ``revoked_reason`` is defined by operators when they push a revoke statement.
* ``source`` is defined by operators when they push document. It is the location where we can find the document if it's public.
* ``extra_data`` is defined by operators when they push document. It is a free location with ``param:value,param2:value2``. It can be used to add extra information for automatic process, or to be compatible with newer Kernel Version.

Find a signature
^^^^^^^^^^^^^^^^

::

    mapping(bytes32 => Document) public Signatures_Book;

To find a signature, you need its ``bytes32`` code. To obtain it, just check the ``Hash_Algorithm`` string. By default, ULCDocKernel uses **SHA3-256** hash of the document.

.. info::
  Because ``mapping`` hashes its key with a *32 bytes* format, it is useless to use hash algorithm with more than *32 bytes* output like SHA3-512.

Function List
=============


Pusher functions
^^^^^^^^^^^^^^^^
Pushing something is the first step to do someting with the data.

::

    function pushDocument(bytes32 _SignatureHash, string memory _source, uint16 _indexDocumentFamily, string memory _extra_data){
        //stuff...
    }
Push a signature into the Signature's Book. Then, you need to confirm it before changing ``sign`` state to ``true``.

.. note::
  When you push a document into your Kernel, you automatically confirm it. So, if you use a simple signature Kernel, your document is signed with only one transaction.

::

    function confirmDocument(bytes32 _SignatureHash){
        //stuff...
    }
Request to confirm a signature. It can also be used to simply sign document without extra_data.

::

    function pushRevokeDocument(bytes32 _SignatureHash, string calldata _reason){
        //stuff...
    }
Request to add a "revoked" statement on the signature, and add a reason for that (can be then displayed on clients).
