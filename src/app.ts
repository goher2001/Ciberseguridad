import express from 'express'
import cors from 'cors'
import * as ClaveRSA from './rsa'
import * as bigintConversion from 'bigint-conversion'
import Subject from './models/subject'
import bcu from 'bigint-crypto-utils'
import * as objectSha from 'object-sha';

//Constants
const port = 3000
let keyRSA: ClaveRSA.rsaKeyPair


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
  return res.status(200).json(bigintConversion.bigintToHex(firma));
} catch (err) {
  console.log(err);
  return res.status(400).json(err);
}})

app.post('/registrarse', async(req,res) => {
  console.log("Datos: " + req.body);
  try{
    const results = await Subject.find({"subject": {"name": req.body.name}});
    if(results != null)
    {
      Subject.findOneAndUpdate({name: req.params.name}, {"$addToSet": {certificados: req.body.certificado}}).exec(function(err, result) {
        console.log("Subject Update: ",result);
        if (err) 
            return res.status(400).send({message: 'Error'});
        else
        return res.status(200).json(result);
    });}
    else{
      const subject = new Subject({
        "name": req.body.name,
        "certificados": [req.body.certificado]
      });
      await subject.save().then(result => {
        return res.status(200).json(result);
      });
    }
    return res.status(200).json(results);
} catch (err) {
    return res.status(404).json(err);
}
})

const setPrivServer = function(privada: ClaveRSA.RsaPrivateKey) {
  keyRSA.privateKey = privada;
}