import { NextApiRequest, NextApiResponse} from "next";
import {clusterApiUrl, Connection, Keypair, PublicKey, Transaction} from "@solana/web3.js";
import {getAccount, getAssociatedTokenAddress, getMint,createTransferCheckedInstruction} from "@solana/spl-token";
// We don't need this because we're creating transaction
// import {createTransfer, createQR, encodeURL} from "@solana/pay";
import BigNumber from "bignumber.js";

const MERCHANT_WALLET = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MERCHANT_PRIVATE_KEY))).publicKey
const splToken = new PublicKey('Hsybc16M3SvBkFdAUSYMVT3q2u2NLT8odnutZWjWULTt')


type GetResponse = {
    label: string,
    icon: string
}

type PostResponse = {
    transaction: string,
    message?: string
}

export default async function apiHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        get(res)
    }

    if (req.method === 'POST') {
        await post(req, res)
    }
}

function get(res: NextApiResponse<GetResponse>) {

    return res.status(200).json({
        label: "Nhi IS DUMB Store",
        icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/5426.png"
    })
}

// https://app.solanapay.com/new?label=Solana%20Pay&recipient=5CXH8Kqhh6f9Gee6GUfsc7VVCbDSSN2NU2x1WyEdNyic
async function post(req, res) {
    const endpoint = clusterApiUrl('devnet')
    const connection = new Connection(endpoint)
     // get store keypair for what?
    // why do we need keypair here?
    // properly to verify that the store is the one who is sending transaction
   // do something here

    // create spl token associate with shopkeypair

    // get pubkey from req

    // create spl transfer instruction


// Get the buyer USDC Address

    // Get the shop's USDC address

    // const recipientField = req.query.recipient;
    // if (!recipientField) throw new Error("missing recipient")
    // if (typeof recipientField !== 'string') throw new Error('invalid recipient');
    //
    // const recipient_pubkey = new PublicKey(recipientField);

    const amountField = req.query.amount;
    // POST <url>/something?amount=1&recipient=jfssdfj434SolanaAddress

    // what is this line doing ???
    // const amount = new BigNumber(amountField)





    const accountField = req.body?.account;
    if (!accountField) throw new Error('missing account');
    if (typeof accountField !== 'string') throw new Error('invalid account');

    const sender = new PublicKey(accountField)

    // let some_transaction = createTransfer(connection, new PublicKey(accountField), {
    //     recipient,
    //     amount,
    //     splToken,
    //     reference,
    //     memo
    // })
    console.log({sender})

    let splTransferIx
    try {
         splTransferIx =  await createSplTokenTransferIx(sender, connection)
    } catch (e) {
        console.log(e)
    }

    let transaction = new Transaction().add(splTransferIx);

    let blockhash = (await connection.getLatestBlockhash()).blockhash

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(0)

    // transaction = Transaction.from(
    //     transaction.serialize({
    //         verifySignatures: false,
    //         requireAllSignatures: false,
    //     })
    // );


    const serializedTransaction = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    })

    const base64Transaction = serializedTransaction.toString('base64');
    const message = 'Thank you for your purchase of ExiledApe #518';

    console.log({base64Transaction})

    res.status(200).send({ transaction: base64Transaction, message})
}


// getOrCreateAssociateTokenAccount(connection, shopKeypair, USDC_ADDRESS, shopKeypair.publicKey)
// create SplTransferIx(sender, connection) -> create spl transfer instruction
async function createSplTokenTransferIx(sender: PublicKey, connection: Connection) {


    const senderInfo = await connection.getAccountInfo(sender);

    if (!senderInfo) throw new Error('sender not found');

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(splToken, sender);
    if (!senderATA) throw new Error("Cannot get sebderATA")
    const senderAccount = await getAccount(connection, senderATA);
    if (!senderAccount.isInitialized) throw new Error('sender not initialized');
    if (senderAccount.isFrozen) throw new Error('sender frozen');

    // Get the merchant's ATA and check that the account exists and can receive tokens
    const merchantATA = await getAssociatedTokenAddress(splToken, MERCHANT_WALLET);
    const merchantAccount = await getAccount(connection, merchantATA);
    if (!merchantAccount.isInitialized) throw new Error('merchant not initialized');
    if (merchantAccount.isFrozen) throw new Error('merchant frozen');

    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);

    console.log({mint})
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // You should always calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    // let amount = calculateCheckoutAmount();
    // amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

    // Check that the sender has enough tokens
    // let amount = BigNumber(10).times(Math.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);
    let amount = BigNumber(10).times(Math.pow(10, mint.decimals) ).integerValue(BigNumber.ROUND_FLOOR)
    const tokens = BigInt(String(amount));
    if (tokens > senderAccount.amount) throw new Error('insufficient funds');
    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    const splTransferIx = createTransferCheckedInstruction(
        senderATA, // source
        splToken, // mint
        merchantATA, // destination
        sender, // wallet owner
        tokens, // amount
        mint.decimals // decimals
    );

    // Create a reference that is unique to each checkout session
    const references = [new Keypair().publicKey];
    console.log({references})

    // add references to the instruction
    for (const pubkey of references) {
        splTransferIx.keys.push({ pubkey, isWritable: false, isSigner: false });
    }

    console.log({splTransferIx})

    return splTransferIx;
}


