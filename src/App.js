import React, {useState, useEffect} from 'react';
import { MintLayout, TOKEN_PROGRAM_ID, Token,} from "@solana/spl-token";

import {Connection, Keypair, SystemProgram, Transaction, PublicKey} from "@solana/web3.js";

// MetaPlex Program Address
export const CANDY_MACHINE_PROGRAM = new PublicKey("cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ");
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const getProvider = () => {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            return provider;
        }
    }
    // window.open("https://phantom.app/", "_blank");
};

function App(dataLength, commitment) {
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


    const sendTransaction = async () => {

        // Create a Transaction!
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: window.solana.publicKey,
                toPubkey: 'DGLyGabZHc2Xb7znZD9FiQouYjtb52dgeZEcGY37uvng',
                lamports: 1000000000,
            })
        );
        transaction.feePayer = window.solana.publicKey;
        transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;


        if (transaction) {
            try {

                // Signed the Transaction Using Phantom!
                let signed = await provider.signTransaction(transaction);

                console.log("Got signature, submitting transaction");

                // Send a Transaction!
                let signature = await connection.sendRawTransaction(signed.serialize());

                // Wait the Transaction!
                await connection.confirmTransaction(signature).then(() => {
                    console.log("Transaction Succeed!");
                    console.log(signature);
                });


            } catch (err) {
                console.log(err);
                console.log("Error: " + JSON.stringify(err));
            }
        }
    };








    // MINT ------------------------------------------------------------------------------------------

    const getTokenWallet = async (wallet, mint) => {
        return (
            await PublicKey.findProgramAddress(
                [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
                SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
            )
        )[0];
    };

    const getMetadata = async (mint) => {
        return (
            await PublicKey.findProgramAddress(
                [
                    Buffer.from("metadata"),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ],
                TOKEN_METADATA_PROGRAM_ID
            )
        )[0];
    };

    const getMasterEdition = async (mint) => {
        return (
            await PublicKey.findProgramAddress(
                [
                    Buffer.from("metadata"),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                    Buffer.from("edition"),
                ],
                TOKEN_METADATA_PROGRAM_ID
            )
        )[0];
    };

    const program = new anchor.Program(idl, CANDY_MACHINE_PROGRAM, provider);

    const sendMint = async () => {
        console.log('Mint! < -----------')

        const mint = Keypair.generate();

        const token = await getTokenWallet( window.solana.publicKey, mint.publicKey);
        console.log(token.toString());

        const metadata = await getMetadata(mint.publicKey);
        console.log(metadata.toString());

        const masterEdition = await getMasterEdition(mint.publicKey);
        console.log(masterEdition.toString());

        const rent = await connection.getMinimumBalanceForRentExemption();
        console.log(rent);


    }








    return (
    <div className="container-fluid">
    <div className="container text-center mt-5">
        {/*<h1>Artyste Mint Using MetaPlex</h1>*/}
        { publicKey && (
            <div>
                { publicKey }
            </div>
        )}

        { !phantomConnect ? (
            <button className="btn btn-primary" onClick={connect}>Connect</button>
        ) : (
            <div>
                <button className="btn btn-danger m-3" onClick={disconnect}>Disconnect</button>

                <button className="btn btn-warning m-3" onClick={sendTransaction}>Transaction</button>

                <button className="btn btn-success m-3" onClick={sendMint}>Mint</button>
            </div>
        )}


    </div>
    </div>
  );
}

export default App;
