const { getDb } = require("./config/db-setup");
const ping = require("ping");

xports.addLog = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    let pingRes = await ping.promise.probe(blockedURL);
    if (pingRes.alive) {
      await getDb().db().collection("logs").insertOne({ blockedURL });
    } else {
      return res.status(400).send("Invalid url");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not add url, try again" });
  }
};
exports.getOneLogURL = async (req, res) => {
  try {
    const { blockedURL } = req.query;
    if (!blockedURL) {
      return res.status(400).send("Missing url or ipAddress");
    }
    const logs = await getDb()
      .db()
      .collection("logs")
      .find({ blockedURL })
      .toArray();
    return res.status(200).json({ logs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch logs, try again" });
  }
};
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await getDb().db().collection("logs").find().toArray();
    return res.status(200).json({ logs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not fetch logs, try again" });
  }
};
