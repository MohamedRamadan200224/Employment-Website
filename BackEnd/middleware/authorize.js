const connect= require("../db/dbconnection");
const util = require('util');

const authorized = async (req, res, next) => {

const query=util.promisify(connect.query).bind(connect); 
const {token}=req.headers;
const user = await query("select * from users where token = ?",[token]);
if (user[0]) {
    res.locals.user = user[0];
    next();
} else {
   
    res.status(403).json({message:"you are not authorized"});
}
};
module.exports = authorized;