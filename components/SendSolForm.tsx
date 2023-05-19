import { FC } from 'react'
import styles from '../styles/Home.module.css'
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import * as Web3 from "@solana/web3.js"
import {PublicKey, SystemProgram} from "@solana/web3.js";
import {throwError} from "rxjs";

const PROGRAM_ID = new PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PROGRAM_DATA_PUBLIC_KEY = new PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")

export const SendSolForm: FC = () => {

    const {connection} = useConnection()
    const {sendTransaction, publicKey} = useWallet()


    console.log({connection})
    const sendSol = event => {
        event.preventDefault()
        console.log(`Send ${event.target.amount.value} SOL to ${event.target.recipient.value}`)
        const key = new Web3.PublicKey(event.target.recipient.value)

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
        </div>
    )
}
