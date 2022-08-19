const mongodb = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

const uri =
  "mongodb+srv://chilDNS:Niko1212@cluster0.vvhxbfm.mongodb.net/?retryWrites=true&w=majority";
let _db;

exports.initDB = (callback) => {
  if (_db) {
    callback(null, _db);
  }
  MongoClient.connect(uri, { useUnifiedTopology: true }).then((client) => {
    _db = client;
    callback(null, _db);
  });
};

exports.getDb = () => {
  if (!_db) {
    throw Error("Database not initialzed");
  }
  return _db;
};
