const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const util= require('util');
const { parsePagination, paginatedResponse } = require("../utils/pagination");

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

//list all jobs (paginated; ?page & ?limit, limit capped at 50)
router.get("",async (req, res)=>{
    try {
    const query = util.promisify(connect.query).bind(connect);
    const { page, limit, offset } = parsePagination(req);
    const search = (req.query.search || "").trim();

    // Perf P0: the old search interpolated the query string into SQL
    // (LIKE '%${search}%') — a leading % means no index can be used even
    // if one existed, and it was an injection hole. The search now uses
    // the FULLTEXT index (see BackEnd/db/migrations/001-add-indexes.sql)
    // with a parameterised placeholder, so the search string never
    // reaches the SQL text. Boolean-mode operators (+ - * etc.) are
    // stripped and every word is required as a prefix match (+word*).
    // NOTE: FULLTEXT ignores words shorter than ft_min_word_len
    // (default 4), so a 1-3 letter search returns no rows.
    let where = "";
    let whereParams = [];
    if (search) {
        const booleanQuery = toBooleanQuery(search);
        if (booleanQuery) {
            where = "where MATCH(position, field) AGAINST (? IN BOOLEAN MODE)";
            whereParams = [booleanQuery];
        }
    }

    const jobColumns = "id, position, field, offer, maxcandidate, description, qualifications";
    let rows;
    let total;
    try {
        const countRows = await query(`select COUNT(*) as total from jobs ${where}`, whereParams);
        total = countRows[0].total;
        rows = await query(
          `select ${jobColumns} from jobs ${where} order by id desc limit ? offset ?`,
          [...whereParams, limit, offset]
        );
    } catch (err) {
        // The FULLTEXT index has not been applied yet (migration not
        // run): fall back to a parameterised PREFIX search, which the
        // jobs(field) index and the UNIQUE key on position can serve.
        // Any other error is re-thrown.
        if (search && err && (err.code === "ER_NO_SUCH_INDEX" || err.errno === 1191)) {
            const like = `${search}%`;
            const countRows = await query("select COUNT(*) as total from jobs where position LIKE ? or field LIKE ?", [like, like]);
            total = countRows[0].total;
            rows = await query(
              `select ${jobColumns} from jobs where position LIKE ? or field LIKE ? order by id desc limit ? offset ?`,
              [like, like, limit, offset]
            );
        } else {
            throw err;
        }
    }

    res.status(200).json(paginatedResponse(rows, total, { page, limit }));
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Turns a free-text search into a boolean-mode query: "financial manager"
// becomes "+financial* +manager*". Strips boolean operators and punctuation
// so user input can never change the query structure.
function toBooleanQuery(term) {
  return String(term)
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9_]/g, ""))
    .filter((word) => word.length > 0)
    .map((word) => `+${word}*`)
    .join(" ");
}

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