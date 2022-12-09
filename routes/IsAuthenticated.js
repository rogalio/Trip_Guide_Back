module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(400).json({ message: "You are not authorized" });
  
 
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin === "admin") {
    return next();
  }
  res.staus(400).json({ message: "You are not authorized" });
};
