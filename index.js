
const {
    SystemProgram, sendAndConfirmTransaction, clusterApiUrl, Connection, Keypair,
    LAMPORTS_PER_SOL, PublicKey, Transaction
} = require('@solana/web3.js');

const {
    transfer, mintTo, getMint, createMint, getOrCreateAssociatedTokenAccount, getAccount,
} = require('@solana/spl-token');


const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const helmet = require('helmet');
const morgan = require('morgan');
const { spawn } = require('child_process');

const dotenv = require('dotenv');
dotenv.config();

// Security best practices
app.use(helmet());

// CORS configuration
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

var corsOptions = {
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    optionsSuccessStatus: 200,
};

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logging middleware
app.use(morgan('combined'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Specify the path to your contracts directory
const contractsPath = path.resolve(__dirname, './contracts');

// Create an express Router
const router = express.Router();

// Mount the router at a specific path
app.use('/api', router);

//............................................................................//
// ...

router.post('/buy', cors(corsOptions), async (req, res) => {

    console.log("Here");
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const walletAddress = req.body.walletAddress;
        const tokenAmount = req.body.tokenAmount * 100000000;
        //Source Account

        console.log("Received :" + tokenAmount);
        console.log("Wallet Address :" + walletAddress);

        const sourceKeypair = Keypair.fromSecretKey(
           // Uint8Array.from(process.env.PRIVATE_KEY.split(',').map(Number))
            Uint8Array.from([164,180,214,227,10,248,133,144,131,26,165,206,55,253,71,216,149,191,143,213,212,163,52,145,66,16,73,86,103,173,135,229,116,154,146,247,127,101,87,56,122,125,18,44,222,67,226,208,132,17,129,187,36,236,78,177,131,40,116,81,79,26,12,114])

        );
        const walletPublicKey = new PublicKey(walletAddress);

        /*    const mintAddress = await createMint(
              connection,
              sourceKeypair,
              sourceKeypair.publicKey,
              sourceKeypair.publicKey,
              9, // We are using 9 to match the CLI decimal default exactly
              
            );
      */


        //const mintAddress = new PublicKey('BXjUkyCJME34fdBNPZ7xJP2id7n8zUBWDJgfMWSypJRs');
        const mintAddress = new PublicKey('HKK3zPX4GWESWYxMtBUCNzAAmVM6AMzm36PRQT4akzmg'); //example.json wallet
        //const mintAddress = new PublicKey('6gd9Yn7z1NWVYWXyeWDxf7p59qWFZ3sKKHPMeAg1kSg5');
        console.log("Mint Address :" + mintAddress.toBase58()); //6gd9Yn7z1NWVYWXyeWDxf7p59qWFZ3sKKHPMeAg1kSg5

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sourceKeypair,
            mintAddress,
            sourceKeypair.publicKey
        );

        console.log("From Account : " + tokenAccount.address.toBase58()); //Howo8TXkoJ7iXbeZspu4zQKZ6XNHjhry56s1ChcP3Ykj

        const to_tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sourceKeypair,
            mintAddress,
            walletPublicKey
        );

        console.log("To Account : " + to_tokenAccount.address.toBase58());

        /*  await mintTo(
            connection,
            sourceKeypair,
            mintAddress,
            tokenAccount.address,
            sourceKeypair.publicKey,
            100000000000 // because decimals for the mint are set to 9 
          )*/

        const mintInfo = await getMint(
            connection,
            mintAddress
        )

        console.log("mintInfo :" + mintInfo.supply);

        const tokenAccountInfo = await getAccount(
            connection,
            tokenAccount.address
        )

        console.log("tokenAccountInfo " + tokenAccountInfo.amount);

        const to_tokenAccountInfo = await getAccount(
            connection,
            to_tokenAccount.address
        )

        console.log("to_tokenAccountInfo " + to_tokenAccountInfo.amount);

        // Transfer the new token to the "toTokenAccount" we just created
        //  const transaction = new Transaction().add(
        // Transfer the new token to the "toTokenAccount" we just created
        const signature = await transfer(
            connection,
            sourceKeypair,
            tokenAccount.address,
            to_tokenAccount.address,
            sourceKeypair.publicKey,
            tokenAmount
        );

        console.log("Signature :" + signature);

        res.send("Tokens Transferred Successfully");

    } catch (error) {
        console.error("Error creating or retrieving token account:", error);
    }

});

//............................................................................//

app.listen(port, () => {
    console.log(`Congratulations ! Server is running on port ${port}` );
});
