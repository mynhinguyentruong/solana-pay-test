import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import {clusterApiUrl, Connection, Keypair, PublicKey, Transaction} from "@solana/web3.js";
import {getAccount, getAssociatedTokenAddress, getMint,createTransferCheckedInstruction} from "@solana/spl-token";
import {createTransfer, createQR, encodeURL} from "@solana/pay";
//import {connection} from "../core

const MERCHANT_WALLET = new PublicKey(JSON.parse(process.env.MERCHANT_PRIVATE_KEY)) // probably wrong
const splToken = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')


type GetResponse = {
    label: string,
    icon: string
}

type PostResponse = {
    transaction: string,
    message?: string
}

export default async function apiHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'get') {
        get(res)
    }
}

function get(res: NextApiResponse<GetResponse>) {
    return res.status(200).json({
        label: "My Store",
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
    const shopKeypair = Keypair.fromSecretKey(JSON.parse(process.env.PRIVATE_KEY))

    // create spl token associate with shopkeypair

    // get pubkey from req

    // create spl transfer instruction


// Get the buyer USDC Address

    // Get the shop's USDC address

    const recipientField = req.query.recipient;
    if (!recipientField) throw new Error("missing recipient")
    if (typeof recipientField !== 'string') throw new Error('invalid recipient');

    const recipient_pubkey = new PublicKey(recipientField);

    const amountField = req.query.amount;
    // POST <url>/something?amount=1&recipient=jfssdfj434SolanaAddress

    // what is this line doing ???
    // const amount = new BigNumber(amountField)





    const accountField = req.body?.account;
    if (!accountField) throw new Error('missing account');
    if (typeof accountField !== 'string') throw new Error('invalid account');

    const sender = new PublicKey(accountField)

    const splTransferIx = await createSplTokenTransferIx(sender, connection)

    const transaction = new Transaction().add(splTransferIx)

    const serializedTransaction = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false
    })

    const base64Transaction = serializedTransaction.toString('base64');
    const message = 'Thank you for your purchase of ExiledApe #518';

    res.status(200).send({ transaction: base64Transaction, message})
}


// getOrCreateAssociateTokenAccount(connection, shopKeypair, USDC_ADDRESS, shopKeypair.publicKey)
// create SplTransferIx(sender, connection) -> create spl transfer instruction
async function createSplTokenTransferIx(sender, connection) {

    const senderInfo = await connection.getAccountInfo(sender);
    if (!senderInfo) throw new Error('sender not found');

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(splToken, sender);
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
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // You should always calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    // let amount = calculateCheckoutAmount();
    // amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

    // Check that the sender has enough tokens
    const tokens = BigInt(String(1));
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

    // add references to the instruction
    for (const pubkey of references) {
        splTransferIx.keys.push({ pubkey, isWritable: false, isSigner: false });
    }

    return splTransferIx;
}


