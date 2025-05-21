const router = require('express').Router();
const { validationResult, body } = require('express-validator');
const connect= require("../db/dbconnection");
const util = require('util');
const bcrypt = require("bcrypt");
const crypto=require('crypto');
const authorized = require('../middleware/authorize');

//login
router.post("/login",body("password").isLength({min:8,max:20}).withMessage("enter password equal to or greater than 8 characters"),body ("email").isEmail().withMessage("please enter a correct email")
,async (req, res) => {
    try {
  const errors =validationResult(req);
if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({errors:errors.array()});
} 
const query = util.promisify(connect.query).bind(connect);    
const checkuseremail= await query("select * from users where email = ?",[req.body.email]);
    if (checkuseremail.length == 0) {
        console.log("Email is incorrect");
        res.status(404).json({errors:[{msg:"Email or password is incorrect",},], });
    }
    
    const checkuserpassword= await bcrypt.compare(req.body.password,checkuseremail[0].password);
    console.log(checkuserpassword);
    if (checkuserpassword===true) {
        delete checkuseremail[0].password;
        await query("update users set status= ? where id= ?",["active",checkuseremail[0].id]);
        res.status(200).json(checkuseremail[0]);
    }else{
        console.log("password is incorrect");
        res.status(404).json({errors:[{msg:"Email or password is incorrect",},], });
    }
 
    } catch (err) {
       console.log(err);
       return res.status(500).json({err:err});
    }
});

//register
router.post("/register",body("name").isString().withMessage("enter a correct name"),body("password").isLength({min:8,max:20}).withMessage("enter password equal to or greater than 8 characters"),body ("email").isEmail().withMessage("please enter a correct email"),body("phone").isNumeric().withMessage("please enter correct number"),async (req, res) => {
    try {
  const errors =validationResult(req);
if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({errors:errors.array()});
} 

    const query = util.promisify(connect.query).bind(connect);
    const checkemailfound= await query("select * from users where email = ?",[req.body.email]);
    if (checkemailfound.length > 0) {
        res.status(400).json({errors:"Email already exists"});
    }
    const userdata = {
        name: req.body.name,
        email: req.body.email,
        phone:req.body.phone,
        password: await bcrypt.hash(req.body.password,10),
        token: crypto.randomBytes(16).toString("hex"),
        status: "active",
    }
 

    await query("insert into users set ?",userdata);
    delete userdata.password;
    res.status(200).json(userdata);

    } catch (err) {
       return res.status(500).json({err:err});
    }
});

// router.post("/logout",body("status").isString().withMessage("enter a correct status"),async (req, res) => {
//     try {
//   const errors =validationResult(req);
// if (!errors.isEmpty()) {
//     console.log(errors);
//     return res.status(400).json({errors:errors.array()});
// } 

//     const query = util.promisify(connect.query).bind(connect);
//    const  userstatus=await query("update users set status = ? where token = ?",[req.body.status,req.headers.token]);
//     res.status(200).json(userstatus);

//     } catch (err) { 
//        return res.status(500).json({err:err});
//     }
// });
module.exports = router;