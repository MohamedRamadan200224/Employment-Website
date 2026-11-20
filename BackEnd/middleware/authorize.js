const connect= require("../db/dbconnection");
const util = require('util');

const authorized = async (req, res, next) => {
    try {
        const query=util.promisify(connect.query).bind(connect);
        const {token}=req.headers;
        // Security: a missing or empty token must never reach the DB.
        // A seeded user with an empty token string would otherwise
        // match `where token = ''` and authenticate anyone who sends
        // an empty token header.
        if (!token) {
            return res.status(403).json({message:"you are not authorized"});
        }
        // Explicit columns only — the password hash and token never
        // need to leave the database for this check.
        const user = await query("select id, name, email, phone, type, status from users where token = ?",[token]);
        if (user[0]) {
            // Security: an in-active account is locked out even with a
            // valid token. Login re-activates an account, so an admin
            // deactivates a user out-of-band (DB) and this check
            // enforces it from that point on.
            if (user[0].status !== "active") {
                return res.status(403).json({message:"your account is not active"});
            }
            res.locals.user = user[0];
            next();
        } else {
            res.status(403).json({message:"you are not authorized"});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({status:"error", message:"Something went wrong"});
    }
};
module.exports = authorized;
