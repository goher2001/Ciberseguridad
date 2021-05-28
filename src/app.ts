import express from 'express'
import cors from 'cors'
import * as ClaveRSA from './rsa'
import * as bigintConversion from 'bigint-conversion'
import * as Subject from './models/subject'
import * as bcu from 'bigint-crypto-utils'

//Constants
const port = 3000;
let keyRSA: ClaveRSA.rsaKeyPair;
let randomGlobal: bigint;
let sub1: Subject.Subject = {
  name: "sccbd",
  date: "28/05/2021",
  positivo: false,
  certs: [""]
};
let sub2: Subject.Subject = {
  name: "fisica",
  date: "31/05/2021",
  positivo: false,
  certs: [""]
};
let sub3: Subject.Subject = {
  name: "quimica",
  date: "29/05/2021",
  positivo: false,
  certs: [""]
};
let classes: Array<Subject.Subject> = [sub1,sub2,sub3];

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
    randomGlobal = randomTemp;
    console.log("Reto Nonce: " + randomGlobal);
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
    var date:string = req.body.date;
    if(randomGlobal != nonceStr){
      console.log("No se ha podido verificar tu identidad");
      return res.status(403).json("No se ha podido verificar tu identidad");
    }
    else{
      console.log("Identidad anonima verificada");
      var found = classes.find(value => (value.name === name) && (value.date === date));
      if(found){
        found.certs.push(signaA);
        console.log("Añadido correctamente");
        return res.status(200).json("Añadido correctamente");
      }
      else{
        console.log("Clase no encontrada")
        return res.status(404).json("Clase no encontrada");
      }
    }
  } catch (err) {
      console.log(err);
      return res.status(404).json(err);
  }
})

app.post('/positivo', async(req,res) => {
  try{
    var nonceStr: bigint = req.body.nonce;   
    var signaA: string = req.body.signature;
    console.log(signaA);
    if(randomGlobal != nonceStr){
      console.log("No se ha podido verificar tu identidad");
      return res.status(403).json("No se ha podido verificar tu identidad");
    }
    else{
      console.log("Identidad anonima verificada");
      let date = new Date();
      let day = date.getDate();
      //Estimaremos que todos los meses tienen 30 dias
      if(day <= 10){
        day = 40 - day;
      }
      var boolPositive: number = 0;
      classes.forEach(element => {
        if(element.certs.find(value => (value == signaA))){
          var daysCovid:Array<string> = element.date.split('/');
          var numbered:number = +daysCovid[0];
          if(numbered < 10)
            numbered = 40 - numbered;
          if((day - numbered) < 10)
          { 
            element.positivo = true;
            boolPositive = 1;
          }
        }
      });
      if(boolPositive > 0)
        {
          console.log("Positivo confirmado");  
          classes.forEach(element => {
            console.log("clase:" + element.name + ", positivo:" + element.positivo);
          });
          return res.status(200).json("Informado correctamente");
        }
        else{
          console.log("No se ha encontrado certificado");
          return res.status(404).json("No se han encontrado clases a las que hayas pertenecido");
        }
    }
  }catch (err) {
    console.log(err);
    return res.status(400).json(err);
}
})
