.. ULCDocuments documentation master file, created by
   sphinx-quickstart on Fri Dec  7 15:06:45 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to ULCD's documentation
========================================

.. image:: img/ULCD_banner.png

.. important::
  **The documentation is not complete yet. It can contain (many) spelling mistakes and may change in near future.**

The first goal of this documentation is to explain main mechanism of ULCDocuments in Ethereum blockchain. Then, everybody will be able to develop WebApp or software that is able to interact with ULCDocuments.

The source code of the project is available `here <https://github.com/blockchain-elite/ULCDocumentsCore>`_

.. note::
    For the beta version, full source code of *smart contracts* are not avaiable.

What is ULCDocuments ?
----------------------

ULCDocuments is an open-source software based on Ethereum blockchain. It gives to everybody a tool to sign all type of documents permanantly.

ULC is acronym of **U**\ltra **L**\ow **C**\ost. The goal is to provide a very cheap way to use the blockchain, by providing free source code.
ULCDocuments is a set of 2 Ethereum smart contract that has to be deployed by different actors to respect decentralized aspect. First, you need to pay once fees to be recorgnased by an authority. Then, you only pay Ethereum gaz and transaction fees.


Why using ULCDocuments ?
------------------------
Using ULCDocuments instead of simply send a transaction with your hash as data let the possibility for developers to **create tools or other smart contracts that can interact easier with your signatures**.

The aim of ULCDocuments is to be an open source project, used on many projects to **create an powerfull tool to get interaction between people' signatures.**

Then, everybody is welcome to create **extensions for PDF**, **Office/LibreOffice plugin**, **native applications** that work with ULCDocuments !

Moreover, feel free to create projects that include ULCDocuments verification in order to trust signature of a third party. You can use and/or create many JSON standards like `Open Badges <https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html>`_ with ULCDocuments !

For the moment, we've created a WebApp that implement ULCDocumentsCore at `https://ulcdocuments.blockchain-elite.fr/ <https://ulcdocuments.blockchain-elite.fr/>`_

Who is behind the project ?
-----------------------------

ULCDocuments is a project developped by `Blockchain Elite Labs <https://www.blockchain-elite.fr/labs/>`_ . The goal is to create some experimental tools based on Blockchain that are open-source, to promote Blockchain Elite know-how.


.. toctree::
   :maxdepth: 2

   ULCDocKernel
   ULCDocMod
