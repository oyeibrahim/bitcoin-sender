# bitcoin-sender
Complete JS implementation of sending Bitcoin programmatically using Blockcypher API.

You must have read and understand Blockcypher API Documentation on sending Bitcoin transaction before using this code.
The documentation is available here: https://www.blockcypher.com/dev/bitcoin/#creating-transactions

Bitcoin can be sent : 
1) from one address to one address
2) from one address to many address
3) from many address to one or many address

The third case is in the case of using a Bitcoin wallet infrastructure and is not implemented in this code yet

The First and Second is available.

The compulsory modules are:
axios - for sending http request to Bockcypher API endpoints
bitcoinjs-lib - bitcoin library for doing core bitcoin tasks like signing transaction

Any other module is just for browser testing (express) or info hidding (dotenv)
