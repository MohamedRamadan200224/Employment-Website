const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const util= require('util');


//listing all applications to admin
router.get("",admin, async (req, res)=>{
    try{
     const query = util.promisify(connect.query).bind(connect);
     const errors =validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({errors:errors.array()});
     } 
 
     const requestrev= await query("select * from qualifications");
     if (!requestrev[0]) {
         return res.status(404).json({msg: "requests not found"});
     }

     res.status(200).json(requestrev);

 }catch (e) {
     res.status(500).json(e);
 }
 });

//  router.get("/checkmax/:id",authorized, async (req, res)=>{
//     try{
//      const query = util.promisify(connect.query).bind(connect);
//      const errors =validationResult(req);
//      if (!errors.isEmpty()) {
//          return res.status(400).json({errors:errors.array()});
//      } 
 
//      const requestrev= await query("SELECT COUNT(*) from qualifications where job_id=?",req.params.id);
//      if (!requestrev[0]) {
//          return res.status(404).json({msg: "requests not found"});
//      }

//      res.status(200).json(requestrev);

//  }catch (e) {
//      res.status(500).json(e);
//  }
//  });

 //Accepting or rejecting application
router.put("/:id",admin,body("applicationreview").isString().withMessage("please enter a valid response"),async (req, res)=>{
    try{
     const query = util.promisify(connect.query).bind(connect);
     const errors =validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({errors:errors.array()});
     } 
 
     const requestrev= await query("update qualifications set applicationreview= ? where id= ?",[req.body.applicationreview,req.params.id]);
    

     res.status(200).json(requestrev);

 }catch (e) {
     res.status(500).json(e);
 }
 });

 //get specific request
 router.get("/:id",admin, async (req, res)=>{
    try{
     const query = util.promisify(connect.query).bind(connect);
     const errors =validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({errors:errors.array()});
     } 
 
     const requestrev= await query("select * from qualifications where id = ?",req.params.id);
     if (!requestrev[0]) {
         return res.status(404).json({msg: "requests not found"});
     }

     res.status(200).json(requestrev);

 }catch (e) {
     res.status(500).json(e);
 }
 });

    module.exports = router;