import React, { useEffect, useState } from 'react';
import { getNodeRpcURL } from "../lib/utils";
import { Connection } from "@solana/web3.js";

const Connect = () => {
    const [version, setVersion] = useState(null);

    useEffect(() => {
        getConnection();
    }, []);

    const getConnection = () => {
        const url = getNodeRpcURL();

        // Create a connection
        // Get the API version
        // and save it to the component's state
    }

    return (
        <div>
            { version
                ? <p>Connected to Solana - {version["solana-core"]}</p>
                : <p>Not connected to Solana</p>
            }
        </div>
    );
}

export default Connect
