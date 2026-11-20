const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const util= require('util');
const { parsePagination, paginatedResponse } = require("../utils/pagination");
const { handleServerError } = require("../utils/errorHandler");


//listing all applications to admin
router.get("",admin, async (req, res)=>{
    try{
     const query = util.promisify(connect.query).bind(connect);
     const errors =validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({errors:errors.array()});
     } 
 
     const { page, limit, offset } = parsePagination(req);

     // Perf P0: one server-side JOIN replaces the old flow where the
     // frontend fetched /requests-review + /jobs + /users and joined
     // them in the browser (O(requests x (jobs + users)) on every
     // render). The applicant name / email / phone and the job title
     // now arrive with each row, already paginated. An empty page is
     // a 200 with data: [] — the old code returned 404 when there were
     // no requests, which the frontend treated as an error.
     const countRows = await query("select COUNT(*) as total from qualifications");
     const total = countRows[0].total;
     const requestrev = await query(
       "select q.id, q.user_id, q.job_id, q.description, q.applicationreview, q.date, " +
       "q.cv_filename, q.cv_size, " +
       "u.name as userName, u.email as userEmail, u.phone as userPhone, " +
       "j.position as jobPosition " +
       "from qualifications q " +
       "join users u on u.id = q.user_id " +
       "join jobs j on j.id = q.job_id " +
       "order by q.id desc limit ? offset ?",
       [limit, offset]
     );

     res.status(200).json(paginatedResponse(requestrev, total, { page, limit }));

 }catch (e) {
     return handleServerError(res, e);
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
     return handleServerError(res, e);
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
 
     // Explicit columns only: `select *` would ship the CV blob
     // (MEDIUMBLOB) inside the JSON response. The download has its
     // own endpoint below (GET /:id/cv).
     const requestrev= await query("select id, user_id, job_id, description, applicationreview, date, cv_filename, cv_mimetype, cv_size from qualifications where id = ?",req.params.id);
     if (!requestrev[0]) {
         return res.status(404).json({msg: "requests not found"});
     }

     res.status(200).json(requestrev);

 }catch (e) {
     return handleServerError(res, e);
 }
 });

 // Download an application's CV (PDF). Admin only. The PDF lives in
 // the row (MEDIUMBLOB) — see middleware/uploadCv.js for why it is
 // not on disk. The filename is sanitised before it reaches the
 // Content-Disposition header: it comes from the applicant.
 router.get("/:id/cv",admin, async (req, res)=>{
    try{
     const query = util.promisify(connect.query).bind(connect);
     const rows = await query("select cv_pdf, cv_filename, cv_mimetype, cv_size from qualifications where id = ?",[req.params.id]);
     if (!rows[0] || !rows[0].cv_pdf) {
         return res.status(404).json({msg: "No CV attached to this application"});
     }
     const safeName = String(rows[0].cv_filename || "cv.pdf").replace(/["\\\r\n]/g, "");
     res.set({
       "Content-Type": rows[0].cv_mimetype || "application/pdf",
       "Content-Disposition": `attachment; filename="${safeName}"`,
       "Content-Length": rows[0].cv_size || rows[0].cv_pdf.length,
     });
     return res.status(200).send(rows[0].cv_pdf);
 }catch (e) {
     return handleServerError(res, e);
 }
 });

    module.exports = router;