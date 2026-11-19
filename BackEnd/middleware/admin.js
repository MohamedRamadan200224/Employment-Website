const connect= require("../db/dbconnection");
const util = require('util');

const admin = async (req, res, next) => {
    try {
        const query=util.promisify(connect.query).bind(connect);
        const {token}=req.headers;
        // Security: a missing or empty token must never reach the DB
        // (see authorize.js — an empty token could match a seeded
        // account with an empty token string).
        if (!token) {
            return res.status(403).json({message:"you are not authorized"});
        }
        // Explicit columns only — the password hash and token never
        // need to leave the database for this check.
        const admin = await query("select id, name, email, phone, type, status from users where token =?",[token]);
        if (admin[0] && admin[0].type == "1") {
            // Security: an in-active admin is locked out even with a
            // valid token (see authorize.js).
            if (admin[0].status !== "active") {
                return res.status(403).json({message:"your account is not active"});
            }
            // Downstream handlers (e.g. DELETE /users/:id) need to
            // know who the caller is — for example to refuse deleting
            // your own account or the last admin.
            res.locals.user = admin[0];
            next();
        } else {
            // Security: the old code echoed the caller's token back in
            // the 403 body and wrote it to the server log. A 403 must
            // never carry a credential.
            res.status(403).json({message:"you are not authorized"});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({status:"error", message:"Something went wrong"});
    }
};
module.exports = admin;
