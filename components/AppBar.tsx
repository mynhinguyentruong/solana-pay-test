import { FC } from 'react'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

import {Transaction, TransactionInstruction, PublicKey} from "@solana/web3.js";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-react-ui";




export const AppBar: FC = () => {
    const {connection} = useConnection();

    const {publicKey, sendTransaction} = useWallet();
    console.log({publicKey})



    return (
        <div className={styles.AppHeader}>
            <Image src="/solanaLogo.png" height={30} width={200} />
            <span>Wallet-Adapter Example</span>
            <WalletMultiButton/>
            <WalletDisconnectButton/>
            <button></button>
        </div>
    )
}
