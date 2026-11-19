const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const util= require('util');
const { parsePagination, paginatedResponse } = require("../utils/pagination");
const { handleServerError } = require("../utils/errorHandler");

// admin create user
router.post("",admin,body("name").isString().withMessage("please enter a valid name"),
body("email").isEmail().withMessage("please enter a valid email address"),
body("password").isString().withMessage("please enter a valid password"),
body("phone").isNumeric().withMessage("please enter a valid number"),
body("status").isString().withMessage("please enter a valid status"),
body("type").isNumeric().withMessage("please enter a valid number"),async (req, res)=>{
try {
    const query = util.promisify(connect.query).bind(connect);
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }
    //insert a new information
    // Security: the old code validated `type` but never stored it, so
    // every admin-created user silently got the DB default (type 0).
    // It also stored no token at all; a fresh random token is issued
    // here, exactly as register does, so the account is usable.
    const userobj={
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password ,10),
        phone: req.body.phone,
        status: req.body.status,
        type: req.body.type,
        token: crypto.randomBytes(16).toString("hex")
    };

    await query("insert into users set ?",userobj)
    return res.status(200).json({msg: 'user created successfully'});

} catch (err) {
    return handleServerError(res, err);
}
});

//update specific user
router.put("/:id",admin,body("name").isString().withMessage("please enter a valid name"),
body("email").isEmail().withMessage("please enter a valid email address"),
body("password").isString().withMessage("please enter a valid password"),
body("phone").isNumeric().withMessage("please enter a valid phone number"),
body("type").isNumeric().withMessage("please enter a valid type number"),async (req, res)=>{
try {
    const query = util.promisify(connect.query).bind(connect);
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }
    // find if the user exists
    const userexists = await query("select * from users where id = ?",req.params.id );

    if (!userexists[0]) {
        return res.status(404).json({msg: "user is not found"});
    }

    //update information
    const userobj={
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password ,10) ,
        phone: req.body.phone,
        type: req.body.type,
    };
    await query("update users set ? where id= ?",[userobj,req.params.id]);
    return res.status(200).json({msg:"updated user successfully"});


} catch (err) {
    return handleServerError(res, err);
}
});

//users list (paginated; ?page & ?limit, limit capped at 50)
router.get("",admin,async (req, res)=>{
    try {
        const query = util.promisify(connect.query).bind(connect);
        const { page, limit, offset } = parsePagination(req);
        // Perf P0: explicit columns only — the old SELECT * returned
        // every password hash and token in the list response.
        const countRows = await query("select COUNT(*) as total from users");
        const total = countRows[0].total;
        const usersrev = await query(
          "select id, name, email, phone, type, status from users order by id desc limit ? offset ?",
          [limit, offset]
        );
        return res.status(200).json(paginatedResponse(usersrev, total, { page, limit }));

    } catch (err) {
        return handleServerError(res, err);
    }
    });

// get a specific user
router.get("/:id",authorized,async (req, res)=>{
    try {
        const query = util.promisify(connect.query).bind(connect);
        // Security: the old route let ANY logged-in user fetch ANY user
        // by id (no ownership check). A user may now fetch only their
        // own profile; admins may fetch anyone. res.locals.user is set
        // by the authorize middleware from the caller's token.
        const caller = res.locals.user;
        if (Number(caller.id) !== Number(req.params.id) && Number(caller.type) !== 1) {
            return res.status(403).json({msg: "you are not authorized to view this user"});
        }
        // Perf P0: explicit columns only — never return password / token.
        const userexists = await query("select id, name, email, phone, type, status from users where id = ?",[req.params.id ,]);
        if (!userexists[0]) {
            return res.status(404).json({msg: "user is not found"});
        }

        return res.status(200).json(userexists[0]);
    } catch (err) {
        return handleServerError(res, err);
    }
});

//users delete
router.delete("/:id",admin,async (req, res)=>{
    try {

        // find if the user exists
        const query = util.promisify(connect.query).bind(connect);
        const userexist = await query("select * from users where id = ?",[req.params.id ,]);
        if (!userexist[0]) {
            return res.status(404).json({msg: "User is not found"});
        }

        // Security: an admin must not delete their own account or the
        // last remaining admin — either way the app ends up with no
        // admin at all. res.locals.user is set by the admin middleware.
        if (Number(userexist[0].id) === Number(res.locals.user.id)) {
            return res.status(403).json({msg: "you cannot delete your own account"});
        }
        if (Number(userexist[0].type) === 1) {
            const adminRows = await query("select COUNT(*) as count from users where type = 1");
            if (adminRows[0].count <= 1) {
                return res.status(403).json({msg: "you cannot delete the last admin"});
            }
        }

        // delete the user
        await query("delete from users where id= ?",userexist[0].id);
        return res.status(200).json({msg: 'user deleted successfully'});


    } catch (err) {
        return handleServerError(res, err);
    }
    });
    module.exports = router;
