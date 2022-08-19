const { getDb } = require("./config/db-setup");
const { ObjectId } = require("mongodb");
const ping = require("ping");

exports.getUrls = async (req, res) => {
  try {
    const urls = await getDb().db().collection("urls").find().toArray();
    return res.status(200).json({ urls });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch urls, try again" });
  }
};
exports.getOneUrl = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Missing id");
    }
    const url = await getDb()
      .db()
      .collection("urls")
      .findOne({ _id: new ObjectId(id) });
    return res.status(200).json({ blockedURL: url });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch url, try again" });
  }
};
exports.search = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    const url = await getDb().db().collection("urls").findOne({ blockedURL });
    return res.status(200).json({ blockedURL: url });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch url, try again" });
  }
};
exports.addUrl = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    let pingRes = await ping.promise.probe(blockedURL);
    if (pingRes.alive) {
      await getDb().db().collection("urls").insertOne({ blockedURL });
    } else {
      return res.status(400).send("Invalid url");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not add url, try again" });
  }
};
exports.deleteUrl = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    await getDb().db().collection("urls").deleteOne({ blockedURL });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "could not delete url, please try again later" });
  }
};
exports.updateUrl = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    const urlExist = await getDb()
      .db()
      .collection("urls")
      .findOne({ blockedURL });
    if (!urlExist) {
      return res.status(400).send("incorrect id");
    }
    let pingRes = await ping.promise.probe(blockedURL);
    if (pingRes.alive) {
      await getDb()
        .db()
        .collection("urls")
        .updateOne({ blockedURL }, { $set: { blockedURL } });
    } else {
      return res.status(400).send("Invalid url");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not update url, try again" });
  }
};
