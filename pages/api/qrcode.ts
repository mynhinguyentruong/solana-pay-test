import {Keypair, PublicKey} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {createQR, encodeURL} from "@solana/pay";

export default async function apiHandler(req, res) {
    console.log(JSON.parse(process.env.MERCHANT_PRIVATE_KEY))
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MERCHANT_PRIVATE_KEY)))
    const recipient = keypair.publicKey
    console.log({recipient})
    const amount = new BigNumber(20);
    const originalReference = Keypair.generate().publicKey;
    const label = 'Jungle Cats store';
    const message = 'Jungle Cats store - your order - #001234';
    const memo = 'JC#4098';

    const url = encodeURL({ recipient, amount, reference: originalReference, label, message, memo });
    console.log({url})
    // const qrCode = createQR(url);
    // console.log(qrCode)
    // console.log(qrCode)
    // console.log(qrCode)

    // res.status(200).send(JSON.stringify(url))
    // {url: 'solana:9TQ1czXPRY1zeQR2cYeVVg4vmKJPXQwX6GGdkuf7NU5…ats+store+-+your+order+-+%23001234&memo=JC%234098'}
    res.status(200).send({url})

}
