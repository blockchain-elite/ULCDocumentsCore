/*
This file is part of ULCDocuments Web App.
ULCDocuments Web App is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
ULCDocuments Javascript API is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with ULCDocuments Web App.  If not, see <http://www.gnu.org/licenses/>.
*/

/** @title  ULCDOCUMENTS JAVASCRIPT API INTERACTOR
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

function ULCDocAPI(_DefaultWeb3provider) {

    this.getWalletAddress = async function() {

        if(!ULCDocAPI.usingInjector()){
            throw new Error("Impossible to get Wallet : no injected ethereum object");
        }

        await ethereum.enable();
        return await Web3Obj.eth.getAccounts();
    };

    /** @dev function that deserialise extra_dataV5 field input
    @param {String} raw_extra_data the raw extra data
    @return {Map} the map with extra_datas properties loaded
    */
    let formatExtraDataV5 = function (raw_extra_data){
        let extra_data_table = raw_extra_data.split(',');
        let result = new Map();
        extra_data_table.forEach(function(oneExtraDataCouple){
            let oneExtraData = oneExtraDataCouple.split(":");
            result.set(oneExtraData[0],oneExtraData[1]);
        });
        return result;
    };

    /** @dev function that serialise extra_data field input
    *  @param {Map} mapExtraData with unserialised data
    * @return {String} serialized data */
    let extraDataFormatV5 = function (mapExtraData){
        //WE ASSUME ':,' char are not used.
        if(mapExtraData.size === 0){
            return "";
        }

        let result = "";

        for(key of mapExtraData.keys()){
            result = result + key + ":" + mapExtraData.get(key) + ",";
        }

        result = result.substr(0, result.length-1);
        return result;
    };

    //the web3 instance we're going to use in this Interactor.
    let Web3Obj;
    //the network stored in cache.
    let whichNetwork = "";

    this.getNetwork = function() {
        return whichNetwork;
    };


    /**********************************/
    //constructor
    if(typeof Web3 === 'undefined'){
        throw new ULCDocAPI.DependancyError("ULCDocAPI needs web3js to work properly.");
    }

    if(ULCDocAPI.usingInjector()){
        Web3Obj = new Web3(Web3.givenProvider);
        Web3Obj.eth.net.getNetworkType().then((result) => whichNetwork = result);
    }

    else {
        if (typeof _DefaultWeb3 === 'undefined'){
            throw new Error("web3 is not injected and not provided in the constructor.");
        }
        Web3Obj = new Web3(_DefaultWeb3provider);
        //We load the network async.
        Web3Obj.eth.net.getNetworkType().then((result) => whichNetwork = result);
    }
    /*********************************/

    /**
    @dev This Object can interact through ULCDocKernel, without Web3 knowledge.
    @dependancies Web3, ULCDocVersionner_ABI,ULCDocKernelV5_ABI, ULCDocModV3_ABI
    @constructor {string} _KernelAddress the address of the kernel.
    */
    this.ULCDocKernel  = function (_KernelAddress) {

        /* ---- CONTRUCTOR --- */

        if(!Web3Obj.utils.isAddress(_KernelAddress)){
            throw new Error("Invalid kernel address provided, or checksum capitalisation failed.");
        }

        /* ------------------- */


        /**
         * @title Function that check if we used connect() function.
         * @dev we must connect to the kernel to get configuration of the latter.
         * @returns {boolean}
         */
        this.kernelConnected = function() {
            return typeof Kernel_Info !== 'undefined';
        };

        let Kernel_ConfigV5 = function(){
            this.version = 0;
            this.operatorsForChange = -1;
            this.hashMethod = "";
            this.docFamily = [];
            this.address = "";
        };

        let raw_address = _KernelAddress;

        //Web3 Contract object
        let Kernel_Contract;

        //KernelInfo of the Kernel Contract
        let Kernel_Info;

        this.getKernelInfo = function() {
            return Kernel_Info;
        };

        /** @title Function to get the address of the object without loading KernelConfig.
        @return {string} the address.
        */
        this.getRawAddress = function() {
            return raw_address;
        };

        /**
         * @title return a  ULCDocKernel object which is the previous kernel.
         * @throws Error if kernel not connected yet;
         * @throws Error if no previous kernel to load.
         * @returns {Promise<ULCDocKernel>}
         */
        this.getPreviousKernel = async function() {

            //We must check before that we have a kernel connected.
            if(!this.kernelConnected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_KERNEL().call();

            if (previousAddress === ULCDocAPI.ZERO_ADDRESS){
                throw new Error("No previous kernel to load");
            }

            return new ULCDocKernel(previousAddress);
        };

        /**
        @title Function that check if current kernel has declared previous one.
        @return {boolean}
        */
        this.hasPreviousKernel = async function() {

            if(!this.kernelConnected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_KERNEL().call();


            return previousAddress !== ULCDocAPI.ZERO_ADDRESS;
        };

        /** @title Function that return the next ULCDocKernel object.
         * @throws Error if kernel not connected yet;
         * @throws if no previous kernel to load.
         * @returns {Promise<ULCDocKernel>}
        */
        this.getNextKernel = async function() {

            //We must check before that we have a kernel connected.
            if(!this.kernelConnected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let nextAddress = await Kernel_Contract.methods.nextKernel().call();

            if (nextAddress === ULCDocAPI.ZERO_ADDRESS){
                throw new Error("No previous kernel to load");
            }

            return new ULCDocKernel(nextAddress);
        };

        /**
        @title Function that check if current kernel has declared previous one.
        @return {boolean}
        */
        this.hasNextKernel = async function() {

            if(!this.kernelConnected()){
                throw new Error("No kernel connected.");
            }

            let nextAddress = await Kernel_Contract.methods.nextKernel().call();


            return nextAddress !== ULCDocAPI.ZERO_ADDRESS;
        };

        /**
         * @title Function that fill Kernel info object for V5 and other compatible kernel Info object.
        */
        let getKernelConfigV5 = async function(){
            //lisibility purposes : creating an array
            let promList = [];
            let info = new Kernel_ConfigV5();

            //loading Kernel info elements
            promList.push(Kernel_Contract.methods.operatorsForChange().call());
            promList.push(Kernel_Contract.methods.HASH_ALGORITHM().call());
            promList.push(Kernel_Contract.methods.DOC_FAMILY_STRINGIFIED().call());

            //Executing Promise.All
            let values = await Promise.all(promList).catch(function(err){
                console.log(err);
                throw new KernelLoadError("Impossible to fetch Kernel basic information V5.");
            });

            info.operatorsForChange = Number(values[0]);
            info.hashMethod = values[1];
            info.docFamily= values[2].split(",");

            return info;
        };

        /**
        @title connect : connect the API to a Kernel to check documents.
        Can throw different errors :
        @Throw KernelVersionError if the version of the kernel is not compatible with the API.
        @Throw KernelLoadError if we can't reach minimal functionnalities.
        @return Kernel_Config object
        */
        this.connect = async function () {
            //First we only load the versionner to know kernel version.
            let Kernel_Versionner = new Web3Obj.eth.Contract(ULCDocVersionner_ABI, raw_address);

            let kernelVersion = 0;

            try {
                //Then we see if it is compatible.
                kernelVersion = await Kernel_Versionner.methods.KERNEL_VERSION().call();
            } catch(err) {
                throw new Error("Impossible to reach Kernel_Version method.");
            }

            let versionCompatible = false;
            kernelVersion = Number(kernelVersion);

            //we check if the Kernel version  is compatible with our list
            for (ver of ULCDocAPI.COMPATIBLE_KERNEL_VERSION){
                if (kernelVersion === ver) {
                    versionCompatible = true;
                    break;
                }
            }

            if(!versionCompatible) {
                throw new Error("Version not compatible. Contract version is '" + kernelVersion + "''");
            }

            //At this moment, Kernel version is OK. Loading the righ ABI according to Kernel Version.
            if(kernelVersion === 5){
                Kernel_Contract = new Web3Obj.eth.Contract(ULCDocKernelV5_ABI, raw_address);
                Kernel_Info = await getKernelConfigV5();
            }
            else {
                throw new Error("Impossible to configure Kernel_Contract.");
            }

            Kernel_Info.version = kernelVersion;
            Kernel_Info.address = raw_address;

            return Kernel_Info;

        };


        /**
        @title Function that check if the current address can sign a document in the kernel
        @return {boolean}
        */
        this.canSign = async function(_Address) {

            if(!this.kernelConnected()){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }

            let isOwner = false;
            let isOperator = false;

            isOwner = await Kernel_Contract.methods.owners(_Address).call();

            if(!isOwner){
                isOperator = await Kernel_Contract.methods.operators(_Address).call();
            }

            return isOwner || isOperator;
        };

        /**
        @title object that handle document behaviour.
        */
        this.KernelDocument = function(_SignatureHash) {

            if(typeof Kernel_Info === 'undefined'){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }
            if(_SignatureHash.substr(0,2) !== "0x"){
                throw new Error("Hash of the document don't start by prefix 0x.");
            }

            let KernelDocumentV5 = function(_Hash){
                this.hash = _Hash;
                this.signed_date = 0;
                this.revoked_date = 0;
                this.document_family = "";
                this.document_family_id = 0;
                this.initialized = false;
                this.signed = false;
                this.revoked = false;
                this.source = "";
                this.extra_data = new Map();
                this.revoked_reason = "";
                this.version = 0;
            };


            let document_obj;

            // CONSTRUCTOR
            if(Kernel_Info.version === 5){
                document_obj = new KernelDocumentV5(_SignatureHash);
            }
            else {
                throw new Error("Impossible to set correct document version. Kernel incompatible ?");
            }

            this.getDocument = function() {
                return document_obj;
            };


            /**
            @title Function that return a DocumentV5 complete infos. Requests are optimized.
            */
            async function loadDocumentInfoV5(){

                document_obj.initialized = await Kernel_Contract.methods.isInitialized(_SignatureHash).call();
                document_obj.hash = _SignatureHash;

                if(document_obj.initialized){
                    let firstPromList = [];
                    firstPromList.push(Kernel_Contract.methods.isSigned(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getDocFamily(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getSource(_SignatureHash).call());
                    firstPromList.push(Kernel_Contract.methods.getExtraData(_SignatureHash).call());

                    let firstSerie = await Promise.all(firstPromList);

                    document_obj.signed = firstSerie[0];
                    document_obj.document_family = firstSerie[1];
                    document_obj.source = firstSerie[2];
                    document_obj.extra_data = formatExtraDataV5(firstSerie[3]);

                    //if the document is signed, we can ask for more information.
                    if(document_obj.signed){
                        let secPromList = [];
                        secPromList.push(Kernel_Contract.methods.isRevoked(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getSignedDate(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getSignatureVersion(_SignatureHash).call());
                        secPromList.push(Kernel_Contract.methods.getRevokedReason(_SignatureHash).call());

                        let secSerie = await Promise.all(secPromList);

                        document_obj.revoked = secSerie[0];
                        document_obj.signed_date = Number(secSerie[1]);
                        document_obj.version = Number(secSerie[2]);
                        document_obj.revoked_reason = secSerie[3];

                        if(document_obj.revoked){
                            let revokedDate = await Kernel_Contract.methods.getRevokedDate(_SignatureHash).call();
                            document_obj.revoked_date = Number(revokedDate);
                        }

                    }
                }

            }

            /**
            @title Function that return information about who confirmed the current document.
            */
            this.getConfirmList = async function(){
                let hashSignature = Web3Obj.utils.soliditySha3("as", document_obj.hash);
                return await Kernel_Contract.methods.getOperatorRequest(hashSignature).call();
            };

            /**
            @title Function that load all document blockchain information.
            @return A document with filled information.
            */
            this.load = async function (){
                //Then we can reach information about the document.
                let docResult;

                if(Kernel_Info.version === 5){
                    try{
                        docResult = await loadDocumentInfoV5();
                    }catch(err){
                        throw new Error("Error when query document to kernel.");
                    }
                }
                else {
                    throw new Error("Impossible to get the document from Kernel. Version error");
                }

                return document_obj;
            };

            /**
            @title Function that fill some document optional data.
            @param _extras {Map} {String}{String}  map of the extra data : param,value
            */
            this.setExtraData = function (_extras) {
                if(_extras instanceof Map){
                    document_obj.extra_data = _extras;
                }
                else{
                    throw new Error("Incorrect extra-data type. Expected Map object");
                }

                //Chaining option avaiable.
                return this;
            };

            this.setSource = function(_source){
                document_obj.source = _source;
                return this;
            };

            this.setDocumentFamily  = function(_DocID){
                document_obj.document_family_id = _DocID;
                return this;
            };

        };

        this.DocumentSignQueue = function(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError) {

            //if not injected, we can't use this.
            if(!ULCDocAPI.usingInjector){
                throw new ULCDocAPI.DependancyError("Impossible to instanciate a Sign Queue without injected ethereum.");
            }

            if(typeof Kernel_Info === 'undefined'){
                throw new Error("Kernel is not connected. Please use connect() function.");
            }


            let whenError = _callBackError;
            let whenTxHash = _callBackTxHash;
            let whenReceipt = _callBackReceipt;

            let documentList = new Map();

            this.addDoc = function(_DocToSign, _identifier) {

                if(typeof _identifier === 'undefined'){
                    throw new Error("Identifier of the document not provided");
                }

                documentList.set(_identifier, _DocToSign.getDocument());

                return this;
            };

            this.getSize = function() {
                return documentList.size;
            };

            this.removeDoc = function( _identifier) {

                if(typeof _identifier === 'undefined'){
                    throw new Error("Identifier of the document not provided");
                }

                documentList.delete(_identifier);
            };

            this.clearQueue = function() {
                documentList.clear();
            };

            this.requestSign = function(_Optimized = true) {

                if(documentList.size === 0) {
                    throw new Error("No document provided.")
                }

                let confirmArray = [];
                let lightPushArray = [];
                let pushArray = [];

                //We assume here all conditions are filled (if we force here then blockchain security will handle it)


                //for each sign request
                for(i of documentList){

                    let oneDoc = i[1];
                    let oneID = i[0];

                    //need to set type of action.
                    if(oneDoc.source === "" && oneDoc.extra_data.size === 0 && oneDoc.document_family_id === 0){
                        //no Info, simple confirmation then.
                        confirmArray.push(oneID);
                    }
                    else {
                        if(oneDoc.source === "" && oneDoc.extra_data.size === 0){
                            //no source and extra data mean no string array so we can call light pushDoc.
                            lightPushArray.push(oneID);
                        }
                        else {
                            //else it gonna be simple pushing.
                            pushArray.push(oneID);
                        }
                    }
                }

                //now execute it.
                //for gaz opti, better to call one by one signing if only one item.

                if(_Optimized){
                    if(confirmArray.length > 0){
                        (confirmArray.length > 1) ? requestMultiConfirmDocs(confirmArray) : requestConfirmDoc(confirmArray[0]);
                    }

                    if(lightPushArray.length > 0){
                        (lightPushArray.length > 1) ? requestMultiLightPushDocs(lightPushArray) : requestPushDoc(lightPushArray[0]);
                    }

                    if(pushArray.length > 0){
                        for (i in pushArray){
                            requestPushDoc(pushArray[i]);
                        }
                    }
                }
                else {
                    for (i in confirmArray) requestConfirmDoc(theDoc[i]);
                    for (i in lightPushArray) requestPushDoc(theDoc[i]);
                    for (i in pushArray) requestPushDoc(pushArray[i]);
                }
            };

            /**
            @title Function that request to Metamask simple Push document blockchain method.
            @param _identifier the identifier of the document
            */
            function requestPushDoc(_identifier){

                let doc = documentList.get(_identifier);
                Kernel_Contract.methods.pushDocument(doc.hash, doc.source, doc.document_family_id, extraDataFormatV5(doc.extra_data)).send({from: _fromAddress})
                .on('error',(error) => {
                    whenError(_identifier, error);
                })
                .on('transactionHash', (hash) => {
                    whenTxHash(_identifier, hash);
                })
                .on('receipt', (receipt) => {
                    whenReceipt(_identifier, receipt);
                });
            }

            function requestConfirmDoc(_identifier){
                Kernel_Contract.methods.requestSignature(documentList.get(_identifier).hash).send({from: _fromAddress})
                .on('error',(error) => {
                    whenError(_identifier, error);
                })
                .on('transactionHash', (hash) => {
                    whenTxHash(_identifier, hash);
                })
                .on('receipt', (receipt) => {
                    whenReceipt(_identifier, receipt);
                });
            }

            function requestMultiConfirmDocs(_identifierArray){

                let hashArray = [];

                for (i of _identifierArray) hashArray.push(documentList.get(i).hash);

                Kernel_Contract.methods.requestSignatureList(hashArray).send({from: _fromAddress})
                .on('error',(error) => {
                    for(i of _identifierArray){
                        whenError(i, error);
                    }
                })
                .on('transactionHash', (hash) => {
                    for(i of _identifierArray){
                        whenTxHash(i, hash);
                    }
                })
                .on('receipt', (receipt) => {
                    for(i of _identifierArray){
                        whenReceipt(i, receipt);
                    }
                });
            }

            function requestMultiLightPushDocs(_identifierArray){

                let docFamilyArray = [];
                let docHashArray = [];

                for (i of _identifierArray) {
                    let oneDoc = documentList.get(i);
                    docFamilyArray.push(oneDoc.document_family_id);
                    docHashArray.push(oneDoc.hash);
                }

                Kernel_Contract.methods.lightPushDocumentList(docHashArray,docFamilyArray).send({from: _fromAddress})
                .on('error',(error) => {
                    for(i of _identifierArray){
                        whenError(i, error);
                    }
                })
                .on('transactionHash', (hash) => {
                    for(i of _identifierArray){
                        whenTxHash(i, hash);
                    }
                })
                .on('receipt', (receipt) => {
                    for(i of _identifierArray){
                        whenReceipt(i, receipt);
                    }
                });
            }


        };

        this.createDocument = function(_SignatureHash){
            return new this.KernelDocument(_SignatureHash);
        };

        this.createSignQueue = function(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError){
            return new this.DocumentSignQueue(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError);
        }

    };

    this.ULCDocModerator = function (_ModeratorAddress) {

    };

    /**
     * @param  _Address {string} the address of the kernel to get.
     * @return {ULCDocAPI.ULCDocKernel} a kernel object.
     */
    this.getKernel = function(_Address){
        return new this.ULCDocKernel(_Address);
    };

    /**
     * @param _Address {string} the addres of the moderator to connect
     * @returns {ULCDocAPI.ULCDocModerator} a moderator object.
     */
    this.getModerator = function(_Address) {
        return new this.ULCDocModerator(_Address);
    }
}

/* STATIC ULCDOC API */

// Version :   [MAIN].[BETA].[BUILD]
ULCDocAPI.getVersion = function() {
    return "0.0.2";
};

//Array of all compatible contract version of this Interactor.
ULCDocAPI.COMPATIBLE_MOD_VERSION = [3];
ULCDocAPI.COMPATIBLE_KERNEL_VERSION  = [5];

/**
 * @title Error object when a dependancy is missing.
 * @param message the message to be displayed
 */

ULCDocAPI.DependancyError = function(message){
    this.constructor.prototype.__proto__ = Error.prototype;
    this.name = this.constructor.name;
    this.message = message;
};

/**
 * @title Default address of moderator smart contract.
 */
ULCDocAPI.DEFAULT_ADDRESS = new function () {
    this.BCE_MOD_MAINNET = "";
    this.BCE_MOD_ROPSTEN = "";
};

/**
 * @title Function that check if an instance of web3/ethereum is injected by browser.
 * @returns {boolean}
 */
ULCDocAPI.usingInjector = function () {
    return typeof window.ethereum !== 'undefined';
};

/**
 * @title Function that return Infura Ropsten Web3 to init the API.
 * @returns {Web3}
 */
ULCDocAPI.getInfuraRopstenWeb3 = function() {
    return "wss://ropsten.infura.io/ws";
};

/**
 * @title Function that return Infura Mainnet Web3 to init the API.
 * @returns {Web3}
 */
ULCDocAPI.getInfuraMainnetWeb3 = function() {
    return "wss://mainnet.infura.io/ws";
};

ULCDocAPI.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
