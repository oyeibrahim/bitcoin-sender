/**
 * Important:
 * You MUST read and understand Blockcypher API documentation on Bitcoin transaction available
 * on this link https://www.blockcypher.com/dev/bitcoin/#creating-transactions
 */


/**ENVIRONMENT */
require('dotenv').config();

/**Axios for making http request */
var axios = require('axios');

/**Bitcoin Library */
var bitcoin = require("bitcoinjs-lib");

/**Express */
var express = require('express');

//initialise express
var app = express();




//Browser testing using express
//One to One
app.get('/send-btc-one/:amount/:destination', function (req, res) {

    sendOneToOne(req.params.amount, req.params.destination)

    res.send("REQUEST COMPLETED, Check console for the result");

})

//One to Many
app.get('/send-btc-many', function (req, res) {

    //get an array of addresses and amount
    let output_array = [ {address:"13wgywjbhwn", amount:0.532}, {address:"1h5wfwgfwg", amount:0.142} ];

    sendOneToMany(output_array)

    res.send("REQUEST COMPLETED, Check console for the result");

})




//--------------------SEND BITCOIN FROM ONE ADDRESS TO ONE ADDRESS-------------------------//
//-----------------------------------------------------------------------------------------//
//Send BTC from the one address to another address using Blockcypher API
//FOR ONE OUTPUT (Destination address)

/**
 * 
 * @param {Number} amount amount to withdraw in BTC value
 * @param {String} destination address to you are sending to
 */

function sendOneToOne(amount, destination) {

    //amount MUST be in SATOSHI, since we are accepting BTC amount, then we MUST convert it to SATOSHI
    //if amount is -1, it won't need to be converted. -1 means the origin wallet should be emptied
    //check Blockcypher API Doc https://www.blockcypher.com/dev/bitcoin/#creating-transactions

    let real_amount = (amount == -1) ? -1 : amount * (Math.pow(10, 8));

    //New Transaction Endpoint
    let create_url = "https://api.blockcypher.com/v1/btc/main/txs/new";

    //Send Transaction Endpoint
    let send_url = "https://api.blockcypher.com/v1/btc/main/txs/send";

    //build transaction body with origin address, destination address and amount

    //-1 will empty the input address but only works with one output
    //process.env.ORIGIN_ADDRESS is the address you are sending from
    let newtx = {
        inputs: [{ addresses: [process.env.ORIGIN_ADDRESS] }],
        outputs: [{ addresses: [destination], value: real_amount }]
    };

    // Create skeleton tx using New Transaction Endpoint
    // Pass in newtx (transaction body) as post param
    axios.post(create_url, JSON.stringify(newtx))
        .then(function (tmptx) {

            //get the result which is a tx skeleton that contains data to sign
            tmptx = tmptx.data;

            //We will sign the data with the Bitcoin Private Key for the origin address

            //process.env.ORIGIN_ADDRESS_PRIVATE_KEY is the Private Key of the origin address
            let keys = new bitcoin.ECPair.fromPrivateKey(Buffer.from(process.env.ORIGIN_ADDRESS_PRIVATE_KEY, 'hex'));

            //sign each of the data that requires signing
            tmptx.pubkeys = [];
            tmptx.signatures = tmptx.tosign.map(function (tosign, n) {
                tmptx.pubkeys.push(keys.publicKey.toString('hex'));
                let signature = keys.sign(Buffer.from(tosign, "hex"));
                let encodedSignature = bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL);
                let hexStr = encodedSignature.toString("hex").slice(0, -2); return hexStr;
            });

            // sending back the transaction with all the signatures using Send Transaction Endpoint
            // Pass in the signed tmptx as post param
            axios.post(send_url, tmptx).then(function (finaltx) {

                //////////////////////
                //      RESULT      //
                //////////////////////

                console.log(finaltx.data);

            })
                .catch(function (e) {
                    console.log(e.response);
                });
        })
        .catch(function (e) {
            console.log(e.response);
        });
}


//-----------------------------------------------------------------------------------------//




//----------------SEND BITCOIN FROM ONE ADDRESS TO MULTIPLE ADDRESSES----------------------//
//-----------------------------------------------------------------------------------------//
//Send BTC from one address to many addresses with different amounts using Blockcypher API
//FOR MULTIPLE OUTPUT

//You MUST Understand One to One before using this

/**
 * 
 * @param {array} output_array array of all output (destination) addresses in format:
 * [ {address:13wgywjbhwn, amount:0.532}, {address:1h5wfwgfwg, amount:0.142} ]
 */

function sendOneToMany(output_array) {

    //New Transaction Endpoint
    let create_url = "https://api.blockcypher.com/v1/btc/main/txs/new";

    //Send Transaction Endpoint
    let send_url = "https://api.blockcypher.com/v1/btc/main/txs/send";

    //build transaction body with origin address, destination addresses with each amount

    //input (origin address)
    //process.env.ORIGIN_ADDRESS is the address you are sending from
    let newtx = {
        inputs: [
            { addresses: [process.env.ORIGIN_ADDRESS] }
        ]
    };

    //output (destination addresses) added from the array
    newtx.outputs = [];

    output_array.forEach(element => {
        newtx.outputs.push({ addresses: [element.address], value: (element.amount * (Math.pow(10, 8))) });
    });
    //The transaction body creation is complete, now we send it

    // Create skeleton tx using New Transaction Endpoint
    // Pass in newtx (transaction body) as post param
    axios.post(create_url, JSON.stringify(newtx))
        .then(function (tmptx) {

            //get the result which is a tx skeleton that contains data to sign
            tmptx = tmptx.data;

            //We will sign the data with the Bitcoin Private Key for the origin address

            //process.env.ORIGIN_ADDRESS_PRIVATE_KEY is the Private Key of the origin address
            let keys = new bitcoin.ECPair.fromPrivateKey(Buffer.from(process.env.ORIGIN_ADDRESS_PRIVATE_KEY, 'hex'));

            //sign each of the data that requires signing
            tmptx.pubkeys = [];
            tmptx.signatures = tmptx.tosign.map(function (tosign, n) {
                tmptx.pubkeys.push(keys.publicKey.toString('hex'));
                let signature = keys.sign(Buffer.from(tosign, "hex"));
                let encodedSignature = bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL);
                let hexStr = encodedSignature.toString("hex").slice(0, -2); return hexStr;
            });

            // sending back the transaction with all the signatures using Send Transaction Endpoint
            // Pass in the signed tmptx as post param
            axios.post(send_url, tmptx).then(function (finaltx) {

                //////////////////////
                //      RESULT      //
                //////////////////////

                console.log(finaltx.data);

            })
                .catch(function (e) {
                    console.log(e.response);
                });
        })
        .catch(function (e) {
            console.log(e.response);
        });

}


//-----------------------------------------------------------------------------------------//




var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log('App Started !!!');
});