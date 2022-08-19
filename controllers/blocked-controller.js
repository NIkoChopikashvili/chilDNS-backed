const { getDb } = require("../config/db-setup");
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
    const { search } = req.query;
    if (!search) {
      return res.status(400).send("Missing search");
    }
    let blocked = await getDb()
      .db()
      .collection("urls")
      .find({ blockedURL: search });
    if (blocked) {
      // curl --request POST \
      // --url https://api.sendgrid.com/v3/mail/send \
      // --header 'Authorization: Bearer <<YOUR_API_KEY>>' \
      // --header 'Content-Type: application/json' \
      // --data '{"personalizations":[{"to":[{"email":"john.doe@example.com","name":"John Doe"}],"subject":"Hello, World!"}],"content": [{"type": "text/plain", "value": "Heya!"}],"from":{"email":"sam.smith@example.com","name":"Sam Smith"},"reply_to":{"email":"sam.smith@example.com","name":"Sam Smith"}}'

      const msg = {
        personalizations: [
          {
            to: [
              {
                email: req.email,
              },
            ],
            subject: "Warni",
          },
        ],
        content: [
          {
            type: "text/html",
            value:
              "<h1>Someone tried to access a blocked url: " + search + "</h1>",
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

      axios.post("https://api.sendgrid.com/v3/mail/send", msg, {
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
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
    let pingRes = await ping.promise.probe(blockedURL);
    console.log(pingRes);

    const insertUrl = getDb().db().collection("urls").insertOne({
      blockedURL,
      ipAddress: pingRes.numeric_host,
      createdAt: new Date(),
    });
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
