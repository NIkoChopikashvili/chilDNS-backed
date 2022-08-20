const { getDb } = require("../config/db-setup");
const { ObjectId } = require("mongodb");
const ping = require("ping");
const axios = require("axios");
const fs = require("fs");

const filePath = "/etc/hosts";
const redirectPath = "127.0.0.1";

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
    const { search } = req.query;
    if (!search) {
      return res.status(400).send("Missing search");
    }
    let blocked = await getDb()
      .db()
      .collection("urls")
      .find({ $or: [{ blockedURL: search }, { ipAddress: search }] })
      .toArray();
    if (blocked.length) {
      const msg = {
        personalizations: [
          {
            to: [
              {
                email: req.email,
              },
            ],
            subject: "WARNING! Someone tried accessing one of blocked urls",
          },
        ],
        content: [
          {
            type: "text/plain",
            value: `Someone tried accessing a blocked website: ${search}`,
          },
        ],
        from: {
          email: "sdhackathon1@gmail.com",
          name: "ChildNS",
        },
        reply_to: {
          email: "sdhackathon1@gmail.com",
          name: "ChildNS",
        },
      };

      await axios.post("https://api.sendgrid.com/v3/mail/send", msg, {
        headers: {
          Authorization:
            "Bearer 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",
        },
      });

      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "failed to search. try again." });
  }
};
exports.addUrl = async (req, res) => {
  try {
    const { blockedURL } = req.body;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }

    fs.readFile(filePath, (err, data) => {
      fileContents = data.toString();

      let addWebsite = "\n" + redirectPath + " " + blockedURL;

      if (fileContents.indexOf(addWebsite) < 0) {
        console.log("Website not present in hosts file");
        fs.appendFile(filePath, addWebsite, (err) => {
          if (err) return console.log(err);
          console.log("File Updated Successfully");
        });
      } else {
        console.log("Website is present");
      }
    });
    let pingRes = await ping.promise.probe(blockedURL);

    const insertUrl = getDb().db().collection("urls").insertOne({
      blockedURL,
      ipAddress: pingRes.numeric_host,
      createdAt: new Date(),
    });
    await axios.post("192.168.100.49:5000/blockURL", { blockedURL });
    return res.json({ message: "Url added" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not add url" });
  }
};
exports.deleteUrl = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    await getDb().db().collection("urls").deleteOne({ blockedURL });
    return res.status(200).json({ status: "success" });
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
      return res.status(400).json({ message: "Invalid url" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not update url, try again" });
  }
};

exports.blockURL = async (req, res) => {
  try {
    const filePath = "/etc/hosts";
    const redirectPath = "127.0.0.1";
    const { blockedURL } = req.body;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }

    fs.readFile(filePath, (err, data) => {
      fileContents = data.toString();

      let addWebsite = "\n" + redirectPath + " " + blockedURL;

      if (fileContents.indexOf(addWebsite) < 0) {
        console.log("Website not present in hosts file");
        fs.appendFile(filePath, addWebsite, (err) => {
          if (err) return console.log(err);
          console.log("File Updated Successfully");
        });
      } else {
        console.log("Website is present");
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not block url, try again" });
  }
};
