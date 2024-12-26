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

    app.post('/data1', async (req, res) => {
      console.log(req.body.id)

    });

    app.get('/brapi', async (req, res) => {
      let requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("https://npgsweb.ars-grin.gov/gringlobal/brapi/v2/traits?commonCropName=GLYCINE-PERENNIAL", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    })

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

