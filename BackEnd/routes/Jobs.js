const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const util= require('util');

//Admin CRUD

//create job
router.post("",admin,body("position").isString().withMessage("please enter a valid job name"),
body("field").isString().withMessage("please enter a valid field"),
body("offer").isString().withMessage("please enter a valid offer"),
body("qualifications").isString().withMessage("please enter a valid qualifications"),
body("description").isString().withMessage("please enter a valid description"),
body("maxcandidate").isNumeric().withMessage("please enter a valid number"),async (req, res)=>{
try {
    const query = util.promisify(connect.query).bind(connect);
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }
    const job={
        qualifications: req.body.qualifications,
        field: req.body.field,
        position: req.body.position,
        maxcandidate: req.body.maxcandidate,
        offer: req.body.offer,
        description: req.body.description,
    };

    
    await query("insert into jobs set ?",job)
    res.status(200).json({msg: 'job created successfully'});

} catch (err) {
    res.status(500).json(err);
}
});

//update job
router.put("/:id",admin,body("position").isString().withMessage("please enter a valid job name"),
body("field").isString().withMessage("please enter a valid field"),
body("offer").isString().withMessage("please enter a valid offer"),
body("qualifications").isString().withMessage("please enter a valid qualifications"),
body("description").isString().withMessage("please enter a valid description"),
body("maxcandidate").isNumeric().withMessage("please enter a valid number"),async (req, res)=>{
try {
    const query = util.promisify(connect.query).bind(connect);
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({errors:errors.array()});
    } 
    // find if the job exists
    const jobexists = await query("select * from jobs where id = ?",[req.params.id,] );
    if (!jobexists[0]) {
        res.status(404).json({msg: "Job is not found"});
    } 

    //insert a new information
    const jobreq={
        qualifications: req.body.qualifications,
        field: req.body.field,
        position: req.body.position,
        maxcandidate: req.body.maxcandidate,
        offer: req.body.offer,
        description: req.body.description,
    };
    await query("update jobs set ? where id= ?",[jobreq,jobexists[0].id]);
    res.status(200).json({msg:"updated jobs successfully"});


} catch (err) {
    console.log(err);
    res.status(500).json(err);
}
});

//delete job
router.delete("/:id",admin,async (req, res)=>{
try {
    
    // find if the job exists
    const query = util.promisify(connect.query).bind(connect);
    const jobexists = await query("select * from jobs where id = ?",[req.params.id ,]);
    if (!jobexists[0]) {
        res.status(404).json({msg: "Job is not found"});
    } 

    // delete the job
    await query("delete from jobs where id= ?",jobexists[0].id);
    res.status(200).json({msg: 'job deleted successfully'});


} catch (err) {
    res.status(500).json(err);
}
});


//User CRUD

//list all jobs
router.get("",async (req, res)=>{
    const query = util.promisify(connect.query).bind(connect);
    let search = "";
    if(req.query.search){
        search = `where position LIKE '%${req.query.search}%' or field LIKE '%${req.query.search}%' `;
    }
    const jobexists = await query(`select * from jobs ${search}`);
    res.status(200).json(jobexists);
});

// show a specific job
router.get("/:id",async (req, res)=>{
    const query = util.promisify(connect.query).bind(connect);
    const jobexists = await query("select * from jobs where id = ?",[req.params.id ,]);
  

    res.status(200).json(jobexists[0]);
});

// request a job
router.post("/request",authorized,
body("job_id").isNumeric().withMessage("please enter a valid number"),
body("description").isString().withMessage("please enter a valid qualifications for job request"),
body("date"), async (req, res)=>{
   try{
    const query = util.promisify(connect.query).bind(connect);
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({errors:errors.array()});
    }
    const jobexists= await query("select * from jobs where id=?",[req.body.job_id,]);
    if (!jobexists[0]) {
        return res.status(404).json({msg: "job not found"});
    }
    
    const requestobj={
        user_id:res.locals.user.id ,
        job_id:jobexists[0].id,
        description: req.body.description,
        date: req.body.date,
    }
    await query("insert into qualifications set ?",requestobj);

    res.status(200).json({msg: 'requested job successfully'});

}catch (e) {
    console.log(e);
    res.status(500).json(e);
}
});

module.exports = router;