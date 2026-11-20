const router = require('express').Router();
const { validationResult, body } = require('express-validator');
const connect= require("../db/dbconnection");
const util = require('util');
const bcrypt = require("bcrypt");
const crypto=require('crypto');
const authorized = require('../middleware/authorize');
const { handleServerError } = require('../utils/errorHandler');

// Security: one generic message for both failure cases, so a caller
// cannot tell a wrong email apart from a wrong password (the old code
// returned 404 for an unknown email and fell through to a TypeError
// -> 500, which made accounts enumerable by status code).
const INVALID_CREDENTIALS = { errors: [{ msg: "Email or password is incorrect" }] };

//login
router.post("/login",body("password").isLength({min:8,max:20}).withMessage("enter password equal to or greater than 8 characters"),body ("email").isEmail().withMessage("please enter a correct email")
,async (req, res) => {
    try {
  const errors =validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()});
}
const query = util.promisify(connect.query).bind(connect);
const checkuseremail= await query("select * from users where email = ?",[req.body.email]);
    if (checkuseremail.length == 0) {
        return res.status(401).json(INVALID_CREDENTIALS);
    }

    const checkuserpassword= await bcrypt.compare(req.body.password,checkuseremail[0].password);
    if (checkuserpassword===true) {
        // Security: rotate the token on every successful login. The old
        // code returned the same permanent token forever, so a leaked
        // token worked indefinitely. The frontend stores whatever token
        // comes back in this response (setAuthUser), so rotation is
        // transparent to it.
        const newToken = crypto.randomBytes(16).toString("hex");
        await query("update users set token = ?, status = ? where id = ?",[newToken, "active", checkuseremail[0].id]);
        checkuseremail[0].token = newToken;
        delete checkuseremail[0].password;
        return res.status(200).json(checkuseremail[0]);
    }else{
        return res.status(401).json(INVALID_CREDENTIALS);
    }

    } catch (err) {
       return handleServerError(res, err);
    }
});

//register
router.post("/register",body("name").isString().withMessage("enter a correct name"),body("password").isLength({min:8,max:20}).withMessage("enter password equal to or greater than 8 characters"),body ("email").isEmail().withMessage("please enter a correct email"),body("phone").matches(/^\+?[0-9]{7,15}$/).withMessage("please enter a correct phone number"),async (req, res) => {
    try {
  const errors =validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()});
}

    const query = util.promisify(connect.query).bind(connect);
    const checkemailfound= await query("select * from users where email = ?",[req.body.email]);
    if (checkemailfound.length > 0) {
        return res.status(400).json({errors:[{msg:"Email already exists"}]});
    }
    // The DB defaults `type` to 0 on insert, but the frontend stores
    // this response as the session (setAuthUser) — so the response
    // must carry `type` too. Without it, a freshly registered user
    // had auth.type === undefined and the JobDetails apply form
    // (gated on the user not being an admin) never rendered.
    const userdata = {
        name: req.body.name,
        email: req.body.email,
        phone:req.body.phone,
        password: await bcrypt.hash(req.body.password,10),
        token: crypto.randomBytes(16).toString("hex"),
        status: "active",
        type: 0,
    }


    await query("insert into users set ?",userdata);
    delete userdata.password;
    return res.status(200).json(userdata);

    } catch (err) {
       return handleServerError(res, err);
    }
});

// Logout (was commented out): invalidate the token in the DB so it can
// never be used again. The old frontend "logout" only cleared
// localStorage, which left the permanent token valid forever.
// The token is set to '' (the column is NOT NULL); authorize/admin
// reject empty tokens, so '' can never authenticate.
router.post("/logout", authorized, async (req, res) => {
    try {
        const query = util.promisify(connect.query).bind(connect);
        await query("update users set token = ? where id = ?", ["", res.locals.user.id]);
        return res.status(200).json({ msg: "logged out successfully" });
    } catch (err) {
        return handleServerError(res, err);
    }
});
module.exports = router;
