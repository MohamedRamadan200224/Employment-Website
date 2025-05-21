const connect= require("../db/dbconnection");
const util = require('util');

const admin = async (req, res, next) => {

const query=util.promisify(connect.query).bind(connect);
const {token}=req.headers;
const admin = await query("select * from users where token =?",[token]);
if (admin[0] && admin[0].type == "1") {
    next();
} else {
    console.log(token);
    res.status(403).json(token);
    
}
};  
module.exports = admin;