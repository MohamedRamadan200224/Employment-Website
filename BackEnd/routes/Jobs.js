const router = require('express').Router();
const connect= require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { validationResult, body } = require('express-validator');
const upload = require('../middleware/uploadimages');
const { handleUploadCv } = require('../middleware/uploadCv');
const util= require('util');
const { parsePagination, paginatedResponse } = require("../utils/pagination");
const { handleServerError } = require("../utils/errorHandler");
const { slugify, generateUniqueSlug } = require("../utils/slugify");

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

    
    // The job-details URL uses a slug, not the numeric id.
    job.slug = await generateUniqueSlug(query, slugify(req.body.position));

    await query("insert into jobs set ?",job)
    res.status(200).json({msg: 'job created successfully'});

} catch (err) {
    return handleServerError(res, err);
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
        return res.status(404).json({msg: "Job is not found"});
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
    // Regenerate the slug when the title changed (or the job never
    // had one), so the URL keeps matching the title. The helper
    // appends -2, -3, ... if another job already has that slug.
    if (req.body.position !== jobexists[0].position || !jobexists[0].slug) {
        jobreq.slug = await generateUniqueSlug(query, slugify(req.body.position), jobexists[0].id);
    }
    await query("update jobs set ? where id= ?",[jobreq,jobexists[0].id]);
    res.status(200).json({msg:"updated jobs successfully"});


} catch (err) {
    console.log(err);
    return handleServerError(res, err);
}
});

//delete job
router.delete("/:id",admin,async (req, res)=>{
try {
    
    // find if the job exists
    const query = util.promisify(connect.query).bind(connect);
    const jobexists = await query("select * from jobs where id = ?",[req.params.id ,]);
    if (!jobexists[0]) {
        return res.status(404).json({msg: "Job is not found"});
    } 

    // delete the job
    await query("delete from jobs where id= ?",jobexists[0].id);
    res.status(200).json({msg: 'job deleted successfully'});


} catch (err) {
    return handleServerError(res, err);
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

    const jobColumns = "id, position, slug, field, offer, maxcandidate, description, qualifications";
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
        // The FULLTEXT query can fail for reasons other than a
        // missing index: on TiDB it rejects MATCH ... AGAINST with
        // an error code other than 1191, so the old narrow catch
        // let every search fail with 500 live. When a search term
        // is present, any MATCH failure now falls back to a
        // parameterised PREFIX search, which the jobs(field) index
        // and the UNIQUE key on position can serve. Any other error
        // is re-thrown.
        if (search) {
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
        return handleServerError(res, err);
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

// Has the logged-in user already applied for this job? The details
// page asks this so it can show "already applied" instead of the
// form — the POST /request 409 below is the enforcement, this is
// only the UI hint. Defined before GET /:slugOrId (same prefix).
router.get("/:slugOrId/applied", authorized, async (req, res) => {
    try {
        const query = util.promisify(connect.query).bind(connect);
        const job = await findJobBySlugOrId(query, req.params.slugOrId);
        if (!job) {
            return res.status(404).json({ msg: "Job is not found" });
        }
        const rows = await query(
            "select id from qualifications where user_id = ? and job_id = ? limit 1",
            [res.locals.user.id, job.id]
        );
        res.status(200).json({ applied: !!rows[0] });
    } catch (err) {
        return handleServerError(res, err);
    }
});

// Look a job up by its URL slug (/full-stack-developer-mern) or,
// for old links and the admin pages, by numeric id.
async function findJobBySlugOrId(query, slugOrId) {
    const param = String(slugOrId);
    let rows = await query("select * from jobs where slug = ?", [param]);
    if (!rows[0] && /^\d+$/.test(param)) {
        rows = await query("select * from jobs where id = ?", [param]);
    }
    return rows[0] || null;
}

// show a specific job
router.get("/:slugOrId",async (req, res)=>{
    try {
        const query = util.promisify(connect.query).bind(connect);
        const jobexists = await findJobBySlugOrId(query, req.params.slugOrId);
        // A missing id used to return 200 with an empty body, so the
        // details page could only show its generic "No job found"
        // fallback. Return 404 like the PUT / DELETE handlers do.
        if (!jobexists) {
            return res.status(404).json({msg: "Job is not found"});
        }

        res.status(200).json(jobexists);
    } catch (err) {
        return handleServerError(res, err);
    }
});

// request a job (with an optional CV PDF — see middleware/uploadCv.js)
router.post("/request",authorized,handleUploadCv,
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

    // One application per user per job: answer 409 when this user
    // already applied (the UNIQUE key on (user_id, job_id) is the
    // race guard — its violation is mapped to the same 409 below).
    const existing = await query(
        "select id from qualifications where user_id = ? and job_id = ? limit 1",
        [res.locals.user.id, jobexists[0].id]
    );
    if (existing[0]) {
        return res.status(409).json({ msg: "You have already applied for this job." });
    }
    
    // CV (PDF) upload: optional. Multer already enforced PDF-only and
    // the 5 MB cap; the magic-byte check below is the real verification
    // (the mimetype header is client-controlled). The PDF is stored in
    // the row (MEDIUMBLOB) because the deployed backend runs on
    // serverless with an ephemeral disk — a file on disk would vanish.
    let cv = null;
    if (req.file) {
      if (req.file.buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        return res.status(400).json({ msg: "CV must be a valid PDF file" });
      }
      cv = {
        cv_pdf: req.file.buffer,
        cv_filename: req.file.originalname,
        cv_mimetype: "application/pdf",
        cv_size: req.file.size,
      };
    }
    const requestobj={
        user_id:res.locals.user.id ,
        job_id:jobexists[0].id,
        description: req.body.description,
        date: req.body.date,
        // Pre-existing bug, found while testing this route: the
        // insert omitted applicationreview, which is NOT NULL with
        // no default — every application failed with 500 on
        // strict-mode MySQL/MariaDB (and TiDB). A new application
        // has no review yet, so it starts empty (pending). The
        // admin sets it to Accepted/Rejected via PUT.
        applicationreview: "",
        ...cv,
    }
    await query("insert into qualifications set ?",requestobj);

    res.status(200).json({msg: 'requested job successfully'});

}catch (e) {
    // Race guard: two requests slipping past the check above hit the
    // UNIQUE(user_id, job_id) key — same clean 409, not a 500.
    if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
        return res.status(409).json({ msg: "You have already applied for this job." });
    }
    console.log(e);
    return handleServerError(res, e);
}
});

module.exports = router;