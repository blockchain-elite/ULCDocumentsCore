/*
This file is part of ULCDocuments Web App.
ULCDocuments Web App is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
ULCDocuments Web App is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with ULCDocuments Web App.  If not, see <http://www.gnu.org/licenses/>.
*/

/** @title  ULCDOCUMENTS KERNEL JAVASCRIPT API INTERACTOR
*  @author Adrien BARBANSON <Contact Form On Blockchain-Élite website>
*  Dev Entity: Blockchain-Elite (https://www.blockchain-elite.fr/)
*/

function ULCDocAPI() {


    //Array of all compatible contract version of this Interactor.
    const COMPATIBLE_MOD_VERSION = [3];
    const COMPATIBLE_KERNEL_VERSION  = [5];

    function DependanciesError(message){
        this.constructor.prototype.__proto__ = Error.prototype;
        this.name = this.constructor.name;
        this.message = message;
    }

    const DEFAULT_ADDRESS = new function () {
        this.BCE_MOD_MAINNET = "";
        this.BCE_MOD_ROPSTEN = "";
    }

    this.getDefaultAddress = function() {
        return DEFAULT_ADDRESS;
    }
    this.getCompatibleKernelVersion = function () {
        return COMPATIBLE_KERNEL_VERSION;
    }

    this.getCompatibleModeratorVersion = function() {
        return COMPATIBLE_MOD_VERSION;
    }

    this.getWalletAddress = async function() {
        await ethereum.enable();
        let localAccount = await Web3Obj.eth.getAccounts();
        return localAccount;
    }

    /** @dev function that deserialise extra_dataV5 field input
    @param {String} raw_extra_data the raw extra data
    @return {Map} the map with extra_datas properties loaded
    */
    formatExtraDataV5 = function (raw_extra_data){
        let extra_data_table = raw_extra_data.split(',');
        let result = new Map();
        extra_data_table.forEach(function(oneExtraDataCouple){
            let oneExtraData = oneExtraDataCouple.split(":")
            result.set(oneExtraData[0],oneExtraData[1]);
        });
        return result;
    }

    /** @dev function that serialise extra_data field input
    *  @param {Map} mapExtraData with unserialised data
    * @return {String} serialized data */
    extraDataFormatV5 = function (mapExtraData){
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
    }

    //the web3 instance we're going to use in this Interactor.
    let Web3Obj;
    let whichNetwork = "";

    this.getNetwork = function() {
        return whichNetwork;
    }

    this.usingInjector = function () {
        return (typeof window.ethereum !== 'undefined');
    }

    this.getInfuraRopstenWeb3 = function() {
        return new Web3("wss://ropsten.infura.io/ws");
    }

    this.getInfuraMainnetWeb3 = function() {
        return new Web3("wss://mainnet.infura.io/ws");
    }

    //constructor
    if(typeof window.ethereum !== 'undefined'){
        //then use injected web3, or throw
        Web3Obj = new Web3(Web3.givenProvider);
        isUsingInjector = true;
        Web3Obj.eth.net.getNetworkType().then((result) => whichNetwork = result);
    }

    else {
        if (typeof _ManualWeb3 === 'undefined'){
            throw new Error("Web3 is not defined and not provided.")
        }
        Web3Obj = _ManualWeb3;
        Web3Obj.eth.net.getNetworkType().then((result) => whichNetwork = result);
    }

    /**
    @dev This Object can interact through ULCDocKernel, without Web3 knowledge.
    @dependancies Web3, ULCDocVersionner_ABI,ULCDocKernelV5_ABI, ULCDocModV3_ABI
    @constructor {String} _KernelAddress the address of the kernel.
    */
    this.ULCDocKernel  = function (_KernelAddress) {

        function KernelVersionError(message) {
            this.constructor.prototype.__proto__ = Error.prototype;
            this.name = this.constructor.name;
            this.message = message;
        }

        function KernelLoadError(message) {
            this.constructor.prototype.__proto__ = Error.prototype;
            this.name = this.constructor.name;
            this.message = message;
        }

        function KernelQueryError(message) {
            this.constructor.prototype.__proto__ = Error.prototype;
            this.name = this.constructor.name;
            this.message = message;
        }

        function Kernel_ConfigV5(){
            this.version = 0;
            this.operatorsForChange = -1;
            this.hashMethod = "";
            this.docFamily = [];
            this.address = "";
        }

        let raw_address = _KernelAddress;

        //Web3 Contract object
        let Kernel_Contract;

        //KernelInfo of the Kernel Contract
        let Kernel_Info;

        this.getKernelInfo = function() {
            return Kernel_Info;
        }

        /** @Title Function to get the address of the object without loading KernelConfig.
        @return {String} the address.
        */
        this.getRawAddress = function() {
            return raw_address;
        }

        /** @Title Function that return the previous ULCDocKernel object.
        @Throw if the previous kernel is null
        */
        this.getPreviousKernel = async function() {

            //We must check before that we have a kernel connected.
            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_KERNEL().call();

            if (previousAddress === "0x0000000000000000000000000000000000000000"){
                throw new KernelLoadError("No previous kernel to load");
            }

            return new ULCDocKernel(_previousAddress);
        }

        /**
        @Title Function that check if current kernel has declared previous one.
        @return {Bool}
        */
        this.hasPreviousKernel = async function() {

            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            let previousAddress = await Kernel_Contract.methods.PREVIOUS_KERNEL().call();


            return previousAddress !== "0x0000000000000000000000000000000000000000";
        }

        /** @Title Function that return the next ULCDocKernel object.
        @Throw if the next kernel is null
        */
        this.getNextKernel = async function() {

            //We must check before that we have a kernel connected.
            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            let nextAddress = await Kernel_Contract.methods.nextKernel().call();

            if (nextAddress === "0x0000000000000000000000000000000000000000"){
                throw new KernelLoadError("No previous kernel to load");
            }

            return new ULCDocKernel(nextAddress);
        }

        /**
        @Title Function that check if current kernel has declared previous one.
        @return {Bool}
        */
        this.hasNextKernel = async function() {

            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            let nextAddress = await Kernel_Contract.methods.nextKernel().call();


            return nextAddress != "0x0000000000000000000000000000000000000000";
        }

        /**
        @Title Function that fill Kernel info object for V5 and other compatible kernel Info object.
        */
        getKernelConfigV5 = async function(){
            //lisibility purposes : creating an array
            let promList = new Array();
            let info = new Kernel_ConfigV5();

            //loading Kernel info elements
            promList.push(Kernel_Contract.methods.operatorsForChange().call());
            promList.push(Kernel_Contract.methods.HASH_ALGORITHM().call());
            promList.push(Kernel_Contract.methods.DOC_FAMILY_STRINGIFIED().call());

            //Executing Promise.All
            values = await Promise.all(promList).catch(function(err){
                console.log(err);
                throw new KernelLoadError("Impossible to fetch Kernel basic information V5.");
            });

            info.operatorsForChange = Number(values[0]);
            info.hashMethod = values[1];
            info.docFamily= values[2].split(",");

            return info;
        }

        /**
        @title connect : connect the API to a Kernel to check documents.
        @Warn Can throw different errors :
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
                throw new KernelLoadError("Impossible to reach Kernel_Version method.");
            }

            let versionCompatible = false;
            kernelVersion = Number(kernelVersion);

            //we check if the Kernel version  is compatible with our list
            for (ver of COMPATIBLE_KERNEL_VERSION){
                if (kernelVersion === ver) {
                    versionCompatible = true;
                    break;
                }
            }

            if(!versionCompatible) {
                throw new KernelVersionError("Version not compatible. Contract version is '" + kernelVersion + "''");
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

        }


        /**
        @Title Function that check if the current address can sign a document in the kernel
        @return bool
        */
        this.isAtleastOperator = async function(_Address) {

            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            let isOwner = false;
            let isOperator = false;

            isOwner = await Kernel_Contract.methods.owners(_Address).call();

            if(!isOwner){
                isOperator = await Kernel_Contract.methods.operators(_Address).call();
            }

            return isOwner || isOperator;
        }

        /**
        @Title object that handle document behaviour.
        */
        this.KernelDocument = function(_SignatureHash) {

            if(typeof Kernel_Info === 'undefined'){
                throw new KernelQueryError("No kernel connected.");
            }

            function KernelDocumentV5(_Hash){
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
            }


            let document_obj;

            if(Kernel_Info.version === 5){
                document_obj = new KernelDocumentV5(_SignatureHash);
            }
            else {
                throw new Error("Impossible to set correct document version. Kernel incompatible ?");
            }

            this.getDocument = function() {
                return document_obj;
            }

            /**
            @Title Function that return a DocumentV5 complete infos. Requests are optimized.
            */
            async function loadDocumentInfoV5(){

                let initialized = await Kernel_Contract.methods.isInitialized(_SignatureHash).call();

                document_obj.initialized = initialized;
                document_obj.hash = _SignatureHash;

                if(document_obj.initialized){
                    let firstPromList = new Array();
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
                        let secPromList = new Array();
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

                return true;
            }

            /**
            @Title Function that return information about who confirmed the current document.
            @param {String} _SignatureHash the hash of the document.
            */
            this.getConfirmList = async function(){
                let hashSignature = Web3Obj.utils.soliditySha3("as", document_hash);
                let signaturesArray = await Kernel_Contract.methods.getOperatorRequest(hashSignature).call();
                return signaturesArray;
            }

            /**
            @Title Function that load all document blockchain information.
            @return A document with filled information.
            */
            this.load = async function (){
                //Then we can reach information about the document.
                let docResult;

                if(Kernel_Info.version === 5){
                    docResult = await loadDocumentInfoV5();
                }
                else {
                    throw new Error("Impossible to get the document from Kernel. Version error");
                }
                return document_obj;
            }

            /**
            @Title Function that fill some document optional data.
            @param {String} _source the source of the document
            @param {Map} {String}{String} _extras map of the extra data : param-value
            */
            this.setExtraData = function (_extras) {
                document_obj.extra_data = _extras;

                //Chaining option avaiable.
                return this;
            }

            this.setSource = function(_source){
                document_obj.source = _source;
                return this;
            }
            this.setDocumentFamily  = function(_DocID){
                document_obj.document_family_id = _DocID;
                return this;
            }

        }

        this.DocumentSignQueue = function(_fromAddress, _callBackTxHash, _callBackReceipt, _callBackError) {

            //if not injected, we can't use this.
            if(typeof window.ethereum === 'undefined'){
                throw new Error("Impossible to instanciate a Sign Queue without injected ethereum.");
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
            }

            this.getSize = function() {
                return documentList.size;
            }

            this.remove = function( _identifier) {

                if(typeof _identifier === 'undefined'){
                    throw new Error("Identifier of the document not provided");
                }
                documentList.remove(_identifier);
            }

            this.requestSign = async function(_Optimized = true) {

                if(typeof Kernel_Info === 'undefined'){
                    throw new KernelQueryError("No kernel connected.");
                }

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

                    console.log(oneDoc);

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
                    for (i in lightPushArray) requestLightPushDoc(theDoc[i]);
                    for (i in pushArray) requestPushDoc(pushArray[i]);
                }
            }

            /**
            @title Function that request to Metamask simple Push document blockchain method.
            @param _identifier the identifier of the document
            */
            function requestPushDoc(_identifier){

                let doc = documentList.get(_identifier);
                //@TODO check if ok with no arg about the account.
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

                let hashArray = new Array();

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

                let docFamilyArray = new Array();
                let docHashArray = new Array();

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


        }


    }

    this.ULCDocModerator = function (_ModeratorAddress) {

    }

}
