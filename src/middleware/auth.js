
const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();
const sqlhelper = require("../helper/sqlhelper");
exports.verifyToken =async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token || token === "") {
    return res.status(401).send({status: false,message: "🚫 Access denied. No token provided 🚫" });
  }

  try {
    // Verify token format (Bearer <token>)
    const tokenParts = token.split(' ');
  
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new Error('Invalid token format');
    }
    if (tokenBlacklist.has(tokenParts[1])) {
      return res.status(401).send({status: false,message: "🚫 Access denied. Invalid token 🚫" });
    }

    // Verify and decode the token
    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
 
    let checkIP = 'SELECT log_login_id,is_block,is_login,session_id,ip_address FROM log_login WHERE admin_ledger_id=? AND ip_address = ? AND user_type IN(1) ORDER BY log_login_id DESC';
    var getUserData = await sqlhelper.select(checkIP, [decoded.admin_ledger_id,decoded.ipAddress], (err, res) => {
        if (err) {
            return 0;
        } else {
            return res;
        }
    });
    if (getUserData.length > 0) {
        const isBlocked = getUserData.filter(item => item.is_block === 1);
        if(isBlocked.length > 0){
          return res.status(401).send({status: false,message: "🚫 Unauthorized access 🚫" });
        }
        const filterConditions = {
          is_login: 0,
          session_id: decoded.session_id,
          ip_address: decoded.ipAddress
        };
        const isLogout = getUserData.filter(item => {
          return Object.keys(filterConditions).every(key => item[key] === filterConditions[key]);
        });
        if(isLogout.length > 0){
          return res.status(401).send({status: false,message: "🚫 Unauthorized access 🚫" });
        }
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({status: false,message: "🚫 Access denied. Invalid token 🚫" });
  }
};

exports.jwtBlocklist = (req, res, next) => {
  try {
      const token = req.header("Authorization");
      const tokenParts = token.split(' ');
      tokenBlacklist.add(tokenParts[1]);
      return 1;
  } catch (error) {
      return res.status(401).send({status: false,message: "🚫 Access denied. Invalid token 🚫" });
  }
}
