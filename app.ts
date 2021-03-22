
import express from 'express'

const port = 3000

const app = express()
app.get('/', (req,res)=>{
    res.send('Hello World')

})

app.get('/user', (req,res)=>{
    const user =  {
        username : 'walrus',
        description : ' it is what it is '
    }
    
    res.json(user)
})
app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`)
})

console.log('hello')