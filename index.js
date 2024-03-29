import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import jwt from  'jsonwebtoken'
const app = express();
const port =process.env.PORT ||5002;
//middleware
app.use(cors({
  origin:[
    "https://flock-e2437.web.app","https://flock-e2437.firebaseapp.com","https://absurd-cherries.surge.sh"
    

  ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());
//token validation middleware
const verifyToken =async (req, res, next) => {
const token =  req?.cookies?.token

if(!token){
  return res.status(401).send({message:"not authorized"})
}
jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
  if(err){
    return res.status(401).send({message:"Forbidden"})
  }
  req.user=decoded
  next()
})

}

//logger api
const logger = (req, res,next)=>{
    console.log("log: info", req.method,req.url);
    next()
}
//connect to mongodb


const uri = `mongodb+srv://${process.env.DB_USER }:${process.env.DB_PASSWORD}@cluster0.fo1holf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     //create a database
     const AllASSIGNMENT =client.db("Study-ally").collection("all-assignments")
     const AllLevel =client.db("Study-ally").collection("all-level")
     const MYAssignment =client.db("Study-ally").collection("my-assignment")
     const User =client.db("Study-ally").collection("user")
//insert data into database
app .post ("/all-assignments", async(req, res) =>{
    const assignments = req.body;
    const result = await  AllASSIGNMENT.insertOne(assignments);
    res.send(result);
})
//show all data in sever site
app.get ("/all-assignments", async(req, res) =>{
  //sorting by level
  let query ={}
  const level = req.query.level;
  if(level){
    query.level = level;
  }
  //pagination
  const page= Number(req.query.page);
  const limit= Number(req.query.limit);
  //pagination logic
  const skip =(page-1)*limit
  const result = await  AllASSIGNMENT .find(query).skip(skip).limit(limit).toArray();
  
  //count data
  const total = await AllASSIGNMENT.countDocuments()
  res.send({
    total,
    result
  });
  
}) 
// see data by id
app.get ("/all-assignments/:id", async(req, res) =>{
    const id =req.params.id;
    const query ={_id: new ObjectId(id)}
    const result = await AllASSIGNMENT.findOne(query);
   
    res.send(result);
  })
  //delete the data  by id
  app.delete( "/all-assignments/:id", async (req, res) =>{
    const id = req.params.id;
    const query = {
      _id:new ObjectId(id),
    };
    const result = await AllASSIGNMENT.deleteOne(query);
    res.send(result);
  });
  //update data by id
  app.put("/all-assignments/:id",async(req, res)=>{
    const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUSer = {
        $set: {
       email :data.email,
    tittle :data.tittle,
     date  : data.date,
    level :  data.level,
     mark :  data.mark,
 description : data.description,
   pdf  : data.pdf,
  url : data.url,
  
        },
      };
      const result = await AllASSIGNMENT.updateOne(
        filter,
        updatedUSer,
        options
      );
      res.send(result);
  })
  //level api
  //insert a new  data
  app.post("/all-level", async (req, res) => {
    const level = req.body;
  
    const result = await AllLevel.insertOne(level);
    
    res.send(result);
  });
  //read all levels
  app.get("/all-level", async (req, res) => {
    const result = await AllLevel.find().toArray();
    res.send(result);
  });
  //myAssignment api
  //insert a new  data
  app.post("/my-assignment", async (req, res) => {
    const level = req.body;
  
    const result = await MYAssignment.insertOne(level);
    
    res.send(result);
  });
  //read all  data
  app.get("/my-assignment", logger,verifyToken, async (req, res) => {
    const result = await MYAssignment.find().toArray();
    res.send(result);
  });
  // see data by id
app.get ("/my-assignment/:id", async(req, res) =>{
  const id =req.params.id;
  const query ={_id: new ObjectId(id)}
  const result = await MYAssignment.findOne(query);
 
  res.send(result);
})
//delete the data  by id
app.delete( "/my-assignment/:id", async (req, res) =>{
  const id = req.params.id;
  const query = {
    _id:new ObjectId(id),
  };
  const result = await MYAssignment.deleteOne(query);
  res.send(result);
});
//user api
//insert a new  data
app.post("/user", async (req, res) => {
  const users = req.body;

  const result = await User.insertOne(users);
  
  res.send(result);
});
//read all  data
app.get("/user", async (req, res) => {
  const result = await User.find().toArray();
  res.send(result);
});
// see data by id
app.get ("/User/:id", async(req, res) =>{
const id =req.params.id;
const query ={_id: new ObjectId(id)}
const result = await User.findOne(query);

res.send(result);
})

// access  token api
 app.post("/access-token", async(req,res)=>{
   const users = req.body;

   
   //generate access token
   const token = jwt.sign(users,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30h"})
   res
   //set token to cookie
   .cookie('token',token,{
    httpOnly:true,
    secure:true,
    sameSite:'none',
   })
   .send({success:true});
   
 })
  
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

//home page
app.get('/', (req, res) => {
    res.send("Welcome to  my server!");
})
// exceed the server
app.listen(port,()=>{console.log(`server is listening on ${port}`)}); 