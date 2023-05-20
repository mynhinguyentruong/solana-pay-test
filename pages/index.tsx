import { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { AppBar } from '../components/AppBar'
import { SendSolForm } from '../components/SendSolForm'
import Head from 'next/head'
import {useWallet} from "@solana/wallet-adapter-react";

const Home: NextPage = (props) => {
    // const {publicKey, wallet} = useWallet()
    // const key = publicKey?.toBase58()

  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta
          name="description"
          content="Wallet-Adapter Example"
        />
      </Head>
      <AppBar />
      <div className={styles.AppBody}>
        <p>balance</p>
        <SendSolForm />

      </div>
    </div>
  );
}

export default Home;
