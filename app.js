const express = require("express");
const app = express();
const { getDb, initDB } = require("./config/db-setup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false, limit: "150mb" }));

app.post("/api/register", async (req, res) => {
  try {
    let { name, password } = req.body;

    const nameExist = await getDb().db().collection("Users").findOne({ name });
    if (nameExist) {
      return res.status(400).json({ error: "Name Already Exist" });
    }

    const hashPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, hashPassword);

    password = hashedPassword;

    await getDb().db().collection("Users").insertOne({ name, password });
    return res.status(200).json({ message: "registered success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    let { name, password } = req.body;

    const nameExist = await getDb().db().collection("Users").findOne({ name });

    if (!nameExist) {
      return res.status(400).json({ error: "name or password incorrect" });
    }
    const hashedPassword = nameExist.password;

    const validPass = await bcrypt.compare(password, hashedPassword);
    if (!validPass) {
      return res.status(400).send("name or password is wrong");
    }
    const token = jwt.sign(
      { _id: nameExist._id, name: name },
      "ASDASFASDAFASD",
      {
        expiresIn: "24h",
      }
    );
    const refreshToken = jwt.sign(
      { _id: nameExist._id, name: name },
      "ASDASDASDGASJNGBASDSSDA",
      { expiresIn: "24h" }
    );
    return res.status(200).json({ token, refreshToken });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "please try again" });
  }
});

app.post("/api/addUrl", async (req, res) => {
  try {
    const { url, ipAddress } = req.body;
    if (!url || !ipAddress) {
      return res.status(400).send("Missing url or ipAddress");
    }

    const insertUrl = getDb()
      .db()
      .collection("urls")
      .insertOne({ url, ipAddress, createdAt: new Date(), updatedAt: null });
    return res.json({ message: "Url added" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not add url" });
  }
});

app.delete("/api/deleteUrl", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !ipAddress) {
      return res.status(400).send("Missing url or ipAddress");
    }
    await getDb().db().collection("urls").deleteOne({ url });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "could not delete url, please try again later" });
  }
});

app.get("/api/getUrls", async (req, res) => {
  try {
    const urls = await getDb().db().collection("urls").find().toArray();
    return res.status(200).json({ urls });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch urls, try again" });
  }
});

app.get("/api/getUrl", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Missing id");
    }
    const url = await getDb()
      .db()
      .collection("urls")
      .findOne({ _id: new ObjectId(id) });
    console.log(url);
    return res.status(200).json({ url });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch url, try again" });
  }
});

app.put("/api/updateUrl", async (req, res) => {
  try {
    const { url, ipAddress } = req.query;
    const urlExist = await getDb().db().collection("urls").findOne({ url });
    if (!urlExist) {
      return res.status(400).send("incorrect id");
    }
    await getDb()
      .db()
      .collection("urls")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { updatedAt: new Date(), url, ipAddress } }
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not update url, try again" });
  }
});

const PORT = 5000;

initDB((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("CONNECTED TO DB");
    app.listen(PORT, () => {
      console.log(`Running on localhost:${PORT}`);
    });
  }
});
