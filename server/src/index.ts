import "reflect-metadata";
import express = require("express");
import cookieParser = require("cookie-parser");
// import EventEmitter = require("events");
import { connection } from "./data-source";
import { APIResponse, APIRequest, config } from "./util";
import * as endpoints from "./api";
import * as auth from "./auth";

let dbReady = false;

let api = express();

api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(cookieParser());

// Check if the database is ready for interaction
function checkDB(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  res.header({
    "Content-Type": "application/json",
    charset: "utf-8",
    "Access-Control-Allow-Origin": req.headers.origin,
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Cookie",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": true,
  });
  if (dbReady) {
    next();
  } else {
    let body: APIResponse = {
      status: "not_ok",
      error: "E_DB_NOT_READY",
      message: "Database not ready",
    };
    res.send(body);
  }
}
api.get("*", checkDB);
api.post("*", checkDB);
api.options("*", (req, res) => {
  // For CORS pre-flight request
  res.header({
    "Content-Type": "application/json",
    charset: "utf-8",
    "Access-Control-Allow-Origin": req.headers.origin,
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Cookie",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": true,
  });
  res.send();
});

// Listen for each individual api endpoint
endpoints.list.forEach((endpoint) => {
  api.get(`/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(endpoints[endpoint], req.query, req as APIRequest, res, next);
  });
  api.post(`/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(endpoints[endpoint], req.body, req as APIRequest, res, next);
  });
  api.get(`/api/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(endpoints[endpoint], req.query, req as APIRequest, res, next);
  });
  api.post(`/api/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(endpoints[endpoint], req.body, req as APIRequest, res, next);
  });
});
auth.list.forEach((endpoint) => {
  api.get(`/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(auth[endpoint], req.query, req as APIRequest, res, next);
  });
  api.post(`/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(auth[endpoint], req.body, req as APIRequest, res, next);
  });
  api.get(`/api/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(auth[endpoint], req.query, req as APIRequest, res, next);
  });
  api.post(`/api/${endpoint}`, (req, res, next) => {
    auth.checkPermsAndExecute(auth[endpoint], req.body, req as APIRequest, res, next);
  });
});

// Listen for the combined endpoint with the individual endpoint as "module" parameter
function combinedApi(
  params: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  let module = "";
  if (params.module) {
    module =
      typeof params.module === "string" ? params.module : params.module[0];
  }
  if (endpoints.list.includes(module)) {
    auth.checkPermsAndExecute(endpoints[module], params, req as APIRequest, res, next);
  } else if (auth.list.includes(module)) {
    auth.checkPermsAndExecute(auth[module], params, req as APIRequest, res, next);
  }
  {
    res.send({
      status: "not_ok",
      error: "E_NOT_FOUND",
      message: "Endpoint not found",
    });
  }
}
api.get("/api", (req, res, next) => {
  combinedApi(req.query, req, res, next);
});
api.post("/api", (req, res, next) => {
  combinedApi(req.body, req, res, next);
});

// Handle endpoint not found
api.get("*", (req, res) => {
  res.send({
    status: "not_ok",
    error: "E_NOT_FOUND",
    message: "Endpoint not found",
  });
});

api.listen(config.api_port);

connection
  .initialize()
  .then(async () => {
    if (config.data_source=="postgres") {
      // Define types and functions
      await connection.query(`DROP FUNCTION IF EXISTS regexp_arr CASCADE;`);
      await connection.query(`
      CREATE OR REPLACE FUNCTION regexp_arr (text, text[])
      RETURNS BOOLEAN AS $$
      SELECT EXISTS(SELECT * FROM unnest($2) AS val WHERE val ~* $1);
      $$ LANGUAGE SQL;`);
  
      await connection.query(`DROP TYPE IF EXISTS floatrange CASCADE;`);
      await connection.query(`
      CREATE TYPE floatrange AS RANGE (
        subtype = float8,
        subtype_diff = float8mi
      );`);
  
      await connection.query(`DROP FUNCTION IF EXISTS range_arr CASCADE;`);
      await connection.query(`
      CREATE OR REPLACE FUNCTION range_arr (floatrange, float8[])
      RETURNS BOOLEAN AS $$
      SELECT EXISTS(SELECT * FROM unnest($2) AS val WHERE val <@ $1);
      $$ LANGUAGE SQL;`);
    }

    dbReady = true;

    console.log("Database connection established.");
  })
  .catch((error) => console.log(error));

export { api };
