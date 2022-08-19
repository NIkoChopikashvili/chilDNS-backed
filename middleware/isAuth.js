const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let decodedToken;
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  try {
    decodedToken = jwt.verify(token, "LALSDKASLDKSAD");
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  if (!decodedToken) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  // Get data from decodedToken
  req.email = decodedToken.email;

  next();
};
