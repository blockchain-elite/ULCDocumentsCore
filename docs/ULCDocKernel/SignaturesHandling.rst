Signature Storing
=========================

Structure
-------------------

ULCDocKernel has a ``struct`` called ``Document`` which has all information about a signed document.

::

    struct Document {
          bool initialized;
          bool signed;
          bool revoked;

          uint256 signed_date;
          uint256 revoked_date;
          uint16 document_family;
          uint8 signature_version;

          string revoked_reason;
          string source;
          string extra_data;
    }

By default, the EVM makes all var set to ``false``, ``0``, or ``""``.

* ``initialized`` is set to ``true`` as soon as someone starts to try signing a document. When it is activated, you cannot push an another version of the document. This is a security measure to prevent **deleting** or **cheating** about the fact that you sign some extra data, document family and so on.

.. info::
  As long as the document is not yet **signed**, you can request to **clean document state** and it will reset the document.

* ``signed`` is set to ``true`` as soon as the document has enough confirmations. **It is the only field you need to trust to know if something has been signed or not.**
* ``revoked`` is set to ``true`` as soon as the document has enough revoke requests from operators.

.. info::
  revoking a signature do not delete signed state. It is just an additional information.

* ``signed_date`` is the UNIX timestamp (result of ``block.timestamp`` in solidity) of the block where signature has been officially sent.
* ``revoked_date`` is the UNIX timestamp (result of ``block.timestamp`` in solidity) of the block where revoked state has been officially declared.
* ``document_family`` is the index of the array where is stored the string value describing the family.
* ``signature_version`` is the version of the Kernel which hosts signatures (for migration purposes)
* ``revoked_reason`` is defined by operators when they push a revoke statement.
* ``source`` is defined by operators when they push document. It is the location where we can find the document if it is public.
* ``extra_data`` is defined by operators when they push document. It is a key-value field (``param:value,param2:value2``). It can be used to add extra information for automatic process, or to be compatible with newer Kernel Version.

Finding a Signature
-----------------

To find a signature, you need its ``bytes32`` code. To obtain it, just check the ``HASH_ALGORITHM`` string. By default, ULCDocKernel uses the document's **SHA3-256** hash.


::

    mapping(bytes32 => Document) public SIGNATURES_BOOK;


.. note::
  Because ``mapping`` hashes its keys with a *32 bytes* format, it is useless to use hash algorithms with more than *32 bytes*, like for example ``SHA3-512``*.


Constructor
-----------

::

  constructor() public {
      HASH_ALGORITHM = "SHA3-256";
  }

Variables
-------------------

Bellow are the variables used by the smart contract for signature management:

::

  uint256 public DOCUMENTS_COUNTER; // stat purposes only
  string public HASH_ALGORITHM; //Essential Information to know how to hash files

  string[] public DOC_FAMILY_LIST = ["Undefined",
  "Diploma",
  "Bill",
  "Order",
  "Letter",
  "Publication",
  "Code",
  "Image",
  "Audio",
  "Video",
  "Binary",
  "Text"];

  // Stringified version to get all array in one .call()
  string public DOC_FAMILY_STRINGIFIED = "Undefined,Diploma,Bill,Order,Letter,Publication,Code,Image,Audio,Video,Binary,Text";

  mapping(bytes32 => Document) public SIGNATURES_BOOK;

Functions
-------------

Push Requests
^^^^^^^^^^^^^

Pushing a document is the first step to signing it with data. Then, other operators will only need to confirm it to make the signature effective. This is the same when revoking a document. If you do not want to add data to your signature, use confirm requests instead, as these are cheaper.

::

  //Request to sign a document, and add data to the signature.
  function pushDocument(bytes32 _SignatureHash, string memory _source, uint16 _indexDocumentFamily, string memory _extra_data) public atLeastOperator whenNotPaused notUpgraded{}

  //Request to add a "revoked" statement on the signature, and add a reason for that (can be then displayed to clients).
  function pushRevokeDocument(bytes32 _SignatureHash, string calldata _reason) external atLeastOperator whenNotPaused {}

.. note::
  When you use a push request on your Kernel (to sign it or revoke it), you automatically confirm it. So, if you use a simple signature Kernel (only one owner/operator needed to confirm the request), your request will accepted in only one transaction.


Confirm Requests
^^^^^^^^^^^^^

When dealing with kernels using multiple operators, only the first one needs to use a push request. Every other operator will only need to confirm that request by using one of the functions below (to sign or revoke a document). These functions can also be used by the first operator instead of the push functions. It won't be possible to use the field ``extra_data``, but it will result in cheaper transaction.

::

  //Request to confirm a signature.
  function confirmDocument(bytes32 _SignatureHash) public atLeastOperator whenNotPaused notUpgraded{}

  //Request to confirm a revoke statement.
  function confirmRevokeDocument(bytes32 _SignatureHash) external atLeastOperator whenNotPaused {}


Multiple Documents Requests
^^^^^^^^^^^^^

It is also possible to request multiple signatures with only one transaction. The only drawback is that you won't be able to push documents with data, because we can't use string arrays with standard ABI (but you will be able to set the document family as it is stored as an integer).

::

  // Confirm mulitple documents
  function confirmDocumentList(bytes32[] calldata _allKeys) external atLeastOperator whenNotPaused notUpgraded {}

  // Push mulitple documents that have only a documentFamily set.
  function lightPushDocumentList(bytes32[] calldata _allKeys, uint16[] calldata _allDocumentFamily) external atLeastOperator whenNotPaused notUpgraded {}


Utility
^^^^^^^^^^^^^

This function can be useful when building an application, but is not needed when signing documents. 

::

  //Return the size of the DOC_FAMILY_LIST array
  function getDocFamilySize() public view returns(uint256) {}