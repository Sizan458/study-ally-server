import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
const app = express();
const port =process.env.PORT ||5001;
//middleware
app.use(cors());
app.use(express.json());

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
    const data= req.body;
    const filter = {_id : new ObjectId(id)};
    const option = { upsert: true };
    const update = {
      $set: {
     email : data.email,
     tittle: data.tittle,
     date: data.date,
     level: data.level,
     mark : data.mark,
     description : data.description,
     pdf: data.pdf,
     img: data.img,
      },
    };
    const result = await AllASSIGNMENT.updateOne(
      filter,
      update,
      option
    );
    res.send(result);
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