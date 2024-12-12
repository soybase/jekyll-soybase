import pymongo
import json
from pymongo import MongoClient, InsertOne

client = pymongo.MongoClient(<CONNECTION STRING>)
db = client.<DATABASE>
collection = db.<COLLECTION>
requesting = []

with open(r"<FILENAME>") as f:
    for jsonObj in f:
        myDict = json.loads(jsonObj)
        requesting.append(InsertOne(myDict))

result = collection.bulk_write(requesting)
client.close()