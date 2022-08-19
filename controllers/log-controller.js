const { getDb } = require("../config/db-setup");
const ping = require("ping");

exports.addLog = async (req, res) => {
  try {
    const { blockedURL } = req.body;
    if (!blockedURL) {
      return res.status(400).send("Missing url");
    }
    const loggedAt = new Date();

    let pingRes = await ping.promise.probe(blockedURL);

    await getDb()
      .db()
      .collection("logs")
      .insertOne({ blockedURL, ipAddress: pingRes.numeric_host, loggedAt });
    return res.status(200).json({ message: "log added" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "could not add log, try again" });
  }
};
exports.getOneLogURL = async (req, res) => {
  try {
    const { url } = req.query;
    if (!id) {
      return res.status(400).send("Missing url");
    }
    const logs = await getDb()
      .db()
      .collection("logs")
      .find({ blockedURL: url })
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
