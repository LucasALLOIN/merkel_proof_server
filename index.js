import * as dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import {readFileSync} from "fs";
import keccak256 from "keccak256";
import {MerkleTree} from "merkletreejs";

let whitelistAddresses = JSON.parse(readFileSync('./addresses.json'));
let merkleTree;

const app = express();

app.use(cors());

app.get("/:address/proof", (req, res, next) => {
    const address = keccak256(req.params.address);

    const hexProof = merkleTree.getHexProof(address);

    if (hexProof.length === 0) {
        return res.status(500).json({
            message: "Can't find proof for this address."
        })
    }

    return res.status(200).json(hexProof);
});

async function main() {
    whitelistAddresses = whitelistAddresses.map((address) => keccak256(address));
    merkleTree = new MerkleTree(whitelistAddresses, keccak256, {sortPairs: true});

    console.log("Merkel root:", merkleTree.getHexRoot());
    app.listen(process.env.PORT, () => {
        console.log(`App listening on port ${process.env.PORT}!`)
    })
}

main()
