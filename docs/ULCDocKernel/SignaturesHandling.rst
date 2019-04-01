How signatures are stored
=========================

Signature Structure
-------------------

ULCDocKernel has a struct called ``Document`` which has all information about a signed document.

::
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
-----------------

::

    mapping(bytes32 => Document) public Signatures_Book;

To find a signature, you need its ``bytes32`` code. To obtain it, just check the ``Hash_Algorithm`` string. By default, ULCDocKernel uses **SHA3-256** hash of the document.

.. info::
  Because ``mapping`` hashes its key with a *32 bytes* format, it is useless to use hash algorithm with more than *32 bytes* output like SHA3-512.

Constructor
-----------

::

  constructor() public {
      Hash_Algorithm = "SHA3-256";
  }

Variables available
-------------------

::

  uint256 public Document_Counter; // stat purposes only
  string public Hash_Algorithm; //Essential Information to know how to hash files

  string[] public document_family_registred = ["Undefined",
  "Diploma",
  "Bill",
  "Order",
  "Letter",
  "Publication",
  "Code",
  "Image",
  "Audio",
  "Video",
  "Binary"];

  mapping(bytes32 => Document) public Signatures_Book;

Function List
-------------

Pushing something is the first step to do sign a document with data. Then, you need to confirm it before changing ``sign`` state to ``true``.

::

  function pushDocument(bytes32 _SignatureHash, string memory _source, uint16 _indexDocumentFamily, string memory _extra_data) public atLeastOperator whenNotPaused notUpgraded{
    }

.. note::
  When you push a document into your Kernel, you automatically confirm it. So, if you use a simple signature Kernel, your document is signed with only one transaction.

::
    //Request to confirm a signature. It can also be used to simply sign document without extra_data.
    function confirmDocument(bytes32 _SignatureHash) public atLeastOperator whenNotPaused notUpgraded{
    }

    //Request to add a "revoked" statement on the signature, and add a reason for that (can be then displayed on clients).
    function pushRevokeDocument(bytes32 _SignatureHash, string calldata _reason) external atLeastOperator whenNotPaused {
    }

    //Request to confirm a revoke statement. It can also be used to simply revoke document without reason
    function confirmRevokeDocument(bytes32 _SignatureHash) external atLeastOperator whenNotPaused {
    }
