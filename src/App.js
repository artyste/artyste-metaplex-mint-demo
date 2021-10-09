import React, {useState, useEffect} from 'react';
import {Connection, SystemProgram, Transaction} from "@solana/web3.js";

const getProvider = () => {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            return provider;
        }
    }
    // window.open("https://phantom.app/", "_blank");
};


function App() {
    const provider = getProvider();
    const [publicKey, setpublicKey] = useState(null);
    const [phantomConnect, setPhantomConnect] = useState(false);
    const connection = new Connection('https://api.devnet.solana.com');

    const connect = async () => {
        const resp = await window.solana.connect();
        setPhantomConnect(true);
        setpublicKey(resp.publicKey.toString());
    };

    const disconnect = async () => {
        window.solana.disconnect().then(() => {
            setPhantomConnect(false);
            setpublicKey(null);
        });
    };

    useEffect(() => {
        if (provider) {
            provider.on("connect", () => {
                setPhantomConnect(true);
                setpublicKey(provider.publicKey?.toString());

            });
            provider.on("disconnect", () => {
                setPhantomConnect(false);

            });
            // try to eagerly connect
            provider.connect({ onlyIfTrusted: true });
            return () => {
                provider.disconnect();
            };
        }
    }, [provider]);


    const createTransferTransaction = async () => {
        if (!publicKey) {
            return;
        }
        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: 'DGLyGabZHc2Xb7znZD9FiQouYjtb52dgeZEcGY37uvng',
                lamports: 100,
            })
        );
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;
        return transaction;
    };


    const sendTransaction = async () => {
        const transaction = await createTransferTransaction();
        console.log(transaction);
        console.log(transaction.recentBlockhash);
        if (transaction) {
            try {
                let signed = await provider.signTransaction(transaction);
                console.log("Got signature, submitting transaction");
                let signature = await connection.sendRawTransaction(signed.serialize());
        //         addLog(
        //             "Submitted transaction " + signature + ", awaiting confirmation"
        //         );
                await connection.confirmTransaction(signature);
        //         addLog("Transaction " + signature + " confirmed");
            } catch (err) {
                console.log(err);
                console.log("Error: " + JSON.stringify(err));
            }
        }
    };





    return (
    <div className="container-fluid">
    <div className="container text-center mt-5">
        <h1>Artyste Mint Using MetaPlex</h1>
        { publicKey && (
            <div>
                { publicKey }
            </div>
        )}

        { !phantomConnect ? (
            <button className="btn btn-primary" onClick={connect}>Connect</button>
        ) : (
            <div>
                <button className="btn btn-danger m-3" onClick={disconnect}>Disconect</button>

                <button className="btn btn-warning m-3" onClick={sendTransaction}>Transaction</button>
            </div>
        )}


    </div>
    </div>
  );
}

export default App;
