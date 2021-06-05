const express = require('express')
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
require('dotenv').config()

const MONGOURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@tdss.duk1n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

mongoose.connect(MONGOURI,{
  keepAlive: true,
  useNewUrlParser: true,
  useNewUrlParser:true,
  useUnifiedTopology: true

})
mongoose.connection.on('connected',()=>{
  console.log("Conneted to mongoDB")
})

require('./models/user')
require('./models/post')

app.use(express.json());
app.use(require('./routes/auth'))
app.use(require('./routes/users'))
app.use(require('./routes/posts'))



app.get('/',(req,res)=>{
  res.send("Welcome to travel diaries server");
})

app.listen(port,()=>{
  console.log('Server is Running');
})