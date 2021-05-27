import express from 'express'
import cors from 'cors'
import * as ClaveRSA from './rsa'
import * as bigintConversion from 'bigint-conversion'
import Subject from './models/subject'
import * as bcu from 'bigint-crypto-utils'
import * as objectSha from 'object-sha';
import './database';

//Constants
const port = 3000;
let keyRSA: ClaveRSA.rsaKeyPair;
let randomGlobal: bigint;


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

app.post('/firmar', async (req, res) => {
  try{
  var keys = await ClaveRSA.generateKeys(2048);
  var cegado:string = req.body.cegado;
  console.log("Request: " + cegado);
  const firma: bigint = keys.privateKey.sign(bigintConversion.hexToBigint(cegado));
  console.log(firma);
  console.log("Firmado: " + bigintConversion.bigintToHex(firma));
  const json = '{"firma": "' + bigintConversion.bigintToHex(firma) + '"}';
  return res.status(200).json(JSON.parse(json));
} catch (err) {
  console.log(err);
  return res.status(400).json(err);
}})
app.post('/validar', async(req,res) => {
  try{
    var signaA: string = req.body.signature;
    var e: string = req.body.pubAe;
    var n: string = req.body.pubAn;
    var pubA: ClaveRSA.RsaPublicKey = new ClaveRSA.RsaPublicKey(bigintConversion.hexToBigint(e),bigintConversion.hexToBigint(n))
    
    var randomTemp: bigint = bcu.randBetween(bigintConversion.hexToBigint("34312431423424"),bigintConversion.hexToBigint("212313")); 
    console.log("Reto Nonce: " + randomTemp);
    randomGlobal = randomTemp;
    var cifrado:string = bigintConversion.bigintToHex(pubA.encrypt(randomTemp));
    return res.status(200).json(cifrado);
} catch (err) {
    console.log(err);
    return res.status(404).json(err);
}
});
app.post('/registrarse', async(req,res) => {
  try{
    var nonceStr: bigint = req.body.nonce;
    var signaA: string = req.body.signature;
    var name: string = req.body.name;
    if(randomGlobal != nonceStr){
      console.log("No se ha podido verificar tu identidad");
      return res.status(403).json("No se ha podido verificar tu identidad");
    }
    else{
      console.log("Identidad anonima verificada");
      console.log(name);
      await Subject.findOne({"subject": {"name": name}}).then(value => {
        if(value != null){
          Subject.findOneAndUpdate({name}, {"$addToSet": {certificados: signaA}}).exec(function(err, result) {
            console.log("Added");
            if(err){
              console.log(err);
              return res.status(404).json(err);
            }
            else
            return res.status(200).json("Gracias por tu aviso anonimo");
          });
        }
          else
          return res.status(401).json("Clase no existente");
        });
    }
  } catch (err) {
      console.log(err);
      return res.status(404).json(err);
  }
})
