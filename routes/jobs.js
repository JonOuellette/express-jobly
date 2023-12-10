"use strict"

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");
const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const jobSearchSechema = require("../schemas/jobNewSchema.json")

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * jobs should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle  }
 *
 * Authorization required: admin
 */


router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });


/** GET /  =>
 *   { jobs: [ { title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", (async function(req, res, next){
    const q = req.query;

    if(q.minSalary !== undefined){
        q.minSalary = +q.minSalary;
    }

    if(q.maxSalary !== undefined){
        q.maxSalary = +q.maxSalary;
    }

    try{
        const result = jsonschema.validate(q, jobSearchSechema);
        if(!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new BadRequestError(listOfErrors);
            return next(error)
        }
        const jobs = await Job.findAll(q);
        return res.json({ jobs });
    } catch(err){
        return next(err);  
    };
}));

/** GET /[jobId] => { job }
 *
 * Returns details of a specific job.
 *
 * Job is { id, title, salary, equity, companyHandle }
 *   where companyHandle is the identifier of the company offering the job.
 *
 * Authorization required: none 
 */

router.get("/:id", ensureAdmin, async function (req, res, next){
    try{
        const job = await Job.get(req.params.id);
        return res.json({job});

    } catch (err){
        return next(err);
    }
});

/** PATCH /[jobId] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Company.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

  router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: +req.params.id });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;