import express from 'express'
import cors from 'cors'
import * as ClaveRSA from './rsa'
import * as bigintConversion from 'bigint-conversion'
import * as user from './models/user'
import * as bcu from 'bigint-crypto-utils'

//Constants
const port = 3000;
let keyRSA: ClaveRSA.rsaKeyPair;
let randomGlobal: bigint;
let user1: user.User = {
  name: "Christian",
  password: '1234',
  pubKey: 147109628126100023593239446490899395001078431760853540398962704792489738934991397248021316777065115915633380757011226090175671693614646227957074381068067568099358213740198667523758748645509515291106503899283478504350755335804498133153167529339067898543596931834333269810934666919976567062886159234861679651851n,
  creditos: 30
};
let user2: user.User = {
  name: "Jaskie",
  password: '1234',
  pubKey: 179594136643155679113162790150632306207235392284218462592197681766549555344457458652339139580350769900680575559082556317850630407510138639768279602686282320375294868038048143428864756116717586319849244422467220085662067639465680690200899115829038312033310126898261753276541121228030800306368072902199867842091n,
  creditos: 15
};
let user3: user.User = {
  name: "Ferran",
  password: '1234',
  pubKey: 0n,
  creditos: 30
};
let classes: Array<user.User> = [user1,user2,user3];

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

app.post('/registrar', async (req, res) => {
  try{
    console.log(req.body.username)
    console.log(req.body.password);
  var keys = await ClaveRSA.generateKeys(1024);
  var username:string = req.body.user;
  var password:string = req.body.password;
    //var found = classes.find()
  var newuser: user.User = new user.User(username,password,keys.publicKey.e,100)
  console.log(keys.publicKey.n)

  const json = '{"privateKey": "' + keys.privateKey.d + '"}';
  console.log()
  return res.status(200).json(JSON.parse(json));
} catch (err) {
  console.log(err);
  return res.status(400).json(err);
}})

app.get('/verificar/:mensaje/:username', async (req, res) => {
  
    console.log(req.params.mensaje);
    console.log(req.params.username);

   // var found = classes.find(value=> (value.name === req.body.username))

  // if(found){
    let verify : ClaveRSA.RsaPublicKey = new ClaveRSA.RsaPublicKey(65537n, 179594136643155679113162790150632306207235392284218462592197681766549555344457458652339139580350769900680575559082556317850630407510138639768279602686282320375294868038048143428864756116717586319849244422467220085662067639465680690200899115829038312033310126898261753276541121228030800306368072902199867842091n)

    console.log(verify.verify(req.body.mensaje));
   //}

 
  })



/*
app.get('/validar/:prueba/:prueb1', async(req,res) => {
  try{
    console.log(req.params.prueba + '/' + req.params.prueb1)
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

*/
