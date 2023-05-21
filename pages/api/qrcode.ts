import {Keypair, PublicKey} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {createQR, encodeURL} from "@solana/pay";

export default async function apiHandler(req, res) {
    console.log(JSON.parse(process.env.MERCHANT_PRIVATE_KEY))
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.MERCHANT_PRIVATE_KEY)))
    const recipient = keypair.publicKey
    console.log({recipient})
    const amount = new BigNumber(0.001);
    const originalReference = Keypair.generate().publicKey;
    const label = 'Nhi is dumb store';
    const message = 'Nhi is dumb store - your order - #001234';
    const memo = 'JC#4098';
    const link = new URL('https://solana-send-sol-frontend-nhi-ymihn.vercel.app/api/checkout')

    const testUrl = encodeURL({link, label, message})

    const url = encodeURL({ recipient, amount, reference: originalReference, label, message, memo });
    console.log({url})
    // const qrCode = createQR(url);
    // console.log(qrCode)
    // console.log(qrCode)
    // console.log(qrCode)

    // res.status(200).send(JSON.stringify(url))
    // {url: 'solana:9TQ1czXPRY1zeQR2cYeVVg4vmKJPXQwX6GGdkuf7NU5…ats+store+-+your+order+-+%23001234&memo=JC%234098'}
    res.status(200).send({url, testUrl})

}
