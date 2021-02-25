const fs = require('fs')
const bip39 = require('bip39')
const bip32 = require('bip32')
const bitcoin = require('bitcoinjs-lib')

function run() {
    const accounts = ['44', '49', '84']
    const phrases = readPhrases()
    const depth = getDepth()
    const targetAddress = getAddress()
    for (const phrase of phrases) {
        for (const account of accounts) {
            for (let i = 0; i <= depth; i ++) {
                const path = `m/${account}'/0'/0'/0/${i}`
                const seed = bip39.mnemonicToSeedSync(phrase)
                const hdnode = bip32.fromSeed(seed)
                const node = hdnode.derivePath(path)
                const { address } = bitcoin.payments.p2sh({
                    redeem: bitcoin.payments.p2wpkh({ pubkey: node.publicKey }),
                });
                if (address === targetAddress) {
                    console.log(`Success with seed phrase:`)
                    console.log(phrase)
                    return
                }
            }
        }
    }
    console.log('Did not find match')
}

function getDepth() {
    return process.argv.length > 3 ? parseInt(process.argv[3]) : 50
}

function getAddress() {
    if (!process.argv[2]) throw new Error("Please provide an address")
    return process.argv[2]
}

function readPhrases() {
    return fs.readFileSync('phrases.txt').toString().split('\n')
}

run()