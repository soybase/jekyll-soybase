const express = require('express');
const {MongoClient} = require('mongodb');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/';

app.use(express.json());
app.use(cors());

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    const db = client.db('grin'); 
    const collection = db.collection('glycine'); 

    // Example API endpoint to get data from MongoDB
    app.get('/data', async (req, res) => {
      console.log("/data")
      try {
        const result = await collection.find({observationDbId: '615056'}).toArray();
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data from MongoDB');
      }
    });


  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });







// const express = require('express');
// const {MongoClient} = require('mongodb');
// const cors = require('cors')

// const app = express();
// const PORT = process.env.PORT || 3000;
// const MONGODB_URI = 'mongodb://localhost:27017/';


// app.use(express.json());
// app.use(cors());

app.get('/brapi', (req, res)=>{
    res.status(200);
        fetch("https://npgsweb.ars-grin.gov/gringlobal/brapi/v2/traits?commonCropName=GLYCINE-PERENNIAL")
        .then(response => response.text())
        .then(result => res.send(result))
        .catch(error => console.log('error', error));
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);