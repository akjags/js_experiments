const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection string
const credentials = '../credentials/';
const db_key = JSON.parse(fs.readFileSync(credentials + 'mongo_keys'));
const url = `mongodb://${db_key.user}:${db_key.pwd}@127.0.0.1:27017`;
const mongo_client = require('mongodb').MongoClient;

const client = new MongoClient(url);

// Database and Collection names
// const dbName = 'tutorial';
// const collectionName = 'jsPsych_demo';


// set database and collection we'll be using
const dbName = 'faceness_pareidolia';
const collectionName = 'data_20230322';
 
async function writeToDB() {
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  collection.insertOne({'name': 'kiara2', 'age': 29.5}, function(err, res) {
      console.log('\t  :: mongodb :: document inserted')
      client.close();
  });

}

async function fetchAndSaveData() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected successfully to server');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Fetch data from the collection
    const documents = await collection.find({}).toArray();
    
    // Convert the documents to a JSON string
    const json = JSON.stringify(documents, null, 2);
    
    // Save the JSON string to a file
    fs.writeFileSync(dbName+'_'+collectionName+'_output.json', json);
    console.log('Data has been saved to output.json');
  } catch (err) {
    console.error('Failed to fetch and save data:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

//writeToDB();
fetchAndSaveData();

