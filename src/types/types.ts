import express from "express";
interface ReqParams {
  req: express.Request;
  res: express.Response;
}

export default ReqParams;
