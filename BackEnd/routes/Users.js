const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const bcrypt = require("bcrypt");
const util= require('util');
const { parsePagination, paginatedResponse } = require("../utils/pagination");

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
    const userobj={
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password ,10),
        phone: req.body.phone,
        status: req.body.status
    };
    
    await query("insert into users set ?",userobj)
    res.status(200).json({msg: 'user created successfully'});

} catch (err) {
    res.status(500).json(err);
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
        console.log(errors); 
        return res.status(400).json({errors:errors.array()});
    } 
    // find if the job exists
    const userexists = await query("select * from users where id = ?",req.params.id );

    //update information
    const userobj={
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password ,10) ,
        phone: req.body.phone,
        type: req.body.type,
    };
    await query("update users set ? where id= ?",[userobj,req.params.id]);
    res.status(200).json({msg:"updated user successfully"});


} catch (err) {
    console.log(err);
    res.status(500).json(err);
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
        res.status(200).json(paginatedResponse(usersrev, total, { page, limit }));

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
    });

// get a specific user
router.get("/:id",authorized,async (req, res)=>{
    const query = util.promisify(connect.query).bind(connect);
    // Perf P0: explicit columns only — never return password / token.
    const userexists = await query("select id, name, email, phone, type, status from users where id = ?",[req.params.id ,]);
    if (!userexists[0]) {
        res.status(404).json({msg: "user is not found"});
    } 

    res.status(200).json(userexists[0]);
});

//users delete
router.delete("/:id",admin,async (req, res)=>{
    try {
        
        // find if the job exists
        const query = util.promisify(connect.query).bind(connect);
        const userexist = await query("select * from users where id = ?",[req.params.id ,]);
        if (!userexist[0]) {
            res.status(404).json({msg: "User is not found"});
        } 
    
        // delete the job
        await query("delete from users where id= ?",userexist[0].id);
        res.status(200).json({msg: 'user deleted successfully'});
    
    
    } catch (err) {
        res.status(500).json(err);
    }
    });
    module.exports = router;