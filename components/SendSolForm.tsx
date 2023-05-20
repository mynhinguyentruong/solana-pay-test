import {FC, useEffect, useRef, useState} from 'react'
import styles from '../styles/Home.module.css'
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import * as Web3 from "@solana/web3.js"
import {Keypair, PublicKey, SystemProgram} from "@solana/web3.js";
import {throwError} from "rxjs";
import {createQR, encodeURL} from "@solana/pay";
import BigNumber from "bignumber.js";

const PROGRAM_ID = new PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PROGRAM_DATA_PUBLIC_KEY = new PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")

type Data = {
    url: String
}


export const SendSolForm: FC = () => {

    const {connection} = useConnection()
    const {sendTransaction, publicKey} = useWallet()

    const [url, setUrl] = useState()
    const ref = useRef<HTMLDivElement>(null);


    console.log({connection})
    const sendSol = event => {
        event.preventDefault()
        console.log(`Send ${event.target.amount.value} SOL to ${event.target.recipient.value}`)
        const key: PublicKey = new Web3.PublicKey(event.target.recipient.value)

        const transaction =  new Web3.Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: key,
                lamports: Web3.LAMPORTS_PER_SOL * event.target.amount.value
            })
        )

        sendTransaction(transaction, connection).then(signature => {
            console.log(`Transaction confirmed on https://explorer.solana.com/tx/${signature}?cluster=devnet`)
        }).catch(err => throwError(err))

    }

    async function getQrCode() {
        fetch('/api/qrcode').then(res => res.json()).then(data => {
            console.log(data)
            const url = data.url
            setUrl(url)
        } )

    }

    useEffect(() => {
        const qrCode = createQR(url)
        console.log({qrCode})
        if (ref.current) {
            ref.current.innerHTML = ''

            qrCode.append(ref.current);
        }
    }, [url])



    return (
        <div>
            <form onSubmit={sendSol} className={styles.form}>
                <label htmlFor="amount">Amount (in SOL) to send:</label>
                <input id="amount" type="text" className={styles.formField} placeholder="e.g. 0.1" required />
                <br />
                <label htmlFor="recipient">Send SOL to:</label>
                <input id="recipient" type="text" className={styles.formField} placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA" required />
                <button type="submit" className={styles.formButton}>Send</button>
            </form>

            <p>Or</p>
            <button onClick={getQrCode}>Generate QR Code</button>
            <div ref={ref}></div>
        </div>
    )
}
