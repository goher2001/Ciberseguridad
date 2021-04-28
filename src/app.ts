import express from 'express'
import cors from 'cors'
import * as rsa from './rsa'
import * as aes from './aes'
import * as post from './models/post'
import * as cipher from './models/cipher'
import * as bigintConversion from 'bigint-conversion'

//Constants
const port = 3000
let keyRSA: rsa.rsaKeyPair
let posts: post.Post[] = []

//Dummy images to show when a client enters in the main page
posts[0] = post.dummyImages[0];
posts[1] = post.dummyImages[1];
posts[2] = post.dummyImages[2];

//Inizializations
const app = express()
app.use(cors({
    origin: 'http://localhost:4200'
  }), express.json())

app.get('/', (req,res)=>{
    res.send('Hello World')
})

app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`)
})

//Upload a file to the posts array

app.post('/upload', async (req,res)=>{
    try{
    const ciphered: cipher.ServerAlert = req.body;
    let cifrado: cipher.AES;
    if (ciphered.type === "AES"){
        const message: string = ciphered.cipher.slice(0, ciphered.cipher.length - 32)
        const tag: string = ciphered.cipher.slice(ciphered.cipher.length - 32, ciphered.cipher.length)
        console.log(message + " " + tag);
        const postDecrypted: Buffer = await aes.decrypt(bigintConversion.hexToBuf(message) as Buffer, bigintConversion.hexToBuf(ciphered.iv) as Buffer, bigintConversion.hexToBuf(tag) as Buffer)
        const savePost:post.Post = {};
        posts.push(savePost);
        res.status(200);
    }
    else{
        const bigintDecrypted: bigint = keyRSA.privateKey.decrypt(bigintConversion.hexToBigint(ciphered.key as string))
        const message: string = ciphered.cipher.slice(0, ciphered.cipher.length - 32)
        const tag: string = ciphered.cipher.slice(ciphered.cipher.length - 32, ciphered.cipher.length)
        const postDecrypted: Buffer = await aes.decrypt(bigintConversion.hexToBuf(message) as Buffer, bigintConversion.hexToBuf(ciphered.iv) as Buffer, bigintConversion.hexToBuf(tag) as Buffer, bigintConversion.bigintToBuf(bigintDecrypted) as Buffer)
        const savePost:post.Post = {};
        posts.push(savePost);
        res.status(200);
    }
}catch(err){
    res.status(500).json(err);
}
})

//Get all Posts we have in the server
app.get('/allPosts', (req,res)=>{
    try{
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json(err);
    }
})