.. ULCDocuments documentation master file, created by
   sphinx-quickstart on Fri Dec  7 15:06:45 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to ULCD's documentation
========================================

.. image:: img/ULCD_banner.png

.. important::
  **The documentation is not complete yet. It may change in near future.**

The main goal of this documentation is to explain the mechanism behind ULCDocuments, on the Ethereum blockchain. This will allow anyone to develop their own WebApp or software to interact with ULCDocuments.

This documentation's source code is available `here <https://github.com/blockchain-elite/ULCDocumentsCore>`_

.. note::
    For the beta version, full source code of *smart contracts* are not avaiable.

What is ULCDocuments ?
----------------------

ULCDocuments is an Free and Open-Source software using the Ethereum blockchain. The goal to make it easy for anyone to sign any type of document permanantly on the blockchain.

ULC is the acronym for **U**\ltra **L**\ow **C**\ost. We aim to provide a very cheap way to certify documents: you only need to pay transactions fees determined by the blockchain when sending signatures.

ULCDocuments is composed of 2 Ethereum smart contracts. They should be deployed by different actors to respect the decentralized aspect of the blockchain.


Why use ULCDocuments ?
------------------------
Using ULCDocuments instead of simply sending a transaction with your hash as data gives developers the possibility to **create tools or other smart contracts which can then interact easily with your signatures**.

We aim to create an open source project, used by many other projects, in order to **create a powerfull tool allowing interaction between people's signatures**. For example, anyone could create **extensions for PDF**, **Office/LibreOffice plugin**, **native applications** working with ULCDocuments!

Feel free to create your own project using ULCDocuments verification in order to trust signature of a third party. You can also use and/or create many JSON standards like `Open Badges <https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html>`_ with ULCDocuments!

To showcase this technology, and to give an example of an application using ULCDocuments, we have created a WebApp implementing ULCDocumentsCore at `https://ulcdocuments.blockchain-elite.fr/ <https://ulcdocuments.blockchain-elite.fr/>`_

Who is behind the project ?
-----------------------------

ULCDocuments is a project developped by `Blockchain Elite Labs <https://www.blockchain-elite.fr/labs/>`_ . The Labs section from BLockchain Elite aims to create some experimental Open-Source tools based on the Blockchain technology, and to promote Blockchain Elite know-how.


.. toctree::
   :maxdepth: 2

   ULCDocKernel
   ULCDocMod
