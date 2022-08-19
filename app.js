const express = require("express");
const app = express();
const { initDB } = require("./config/db-setup");
const routes = require("routes/routes");

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false, limit: "150mb" }));

app.use("/api", routes);

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
