import { Request, Response } from "express";
import { connection } from "../data-source";
import { Session } from "../entity";
import { APIResponse, APIError } from "../util";

export default async function logout(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  try {
    let sessionId = req.cookies.mustemmer_session_id;
    let session = await connection.manager.findOne(Session, {
      where: { id: sessionId },
    });
    if (session.expire == null || session.expire !== null && session.expire.valueOf() > Date.now()) {
      session.expire = new Date();
      await connection.manager.save(session);
      res.clearCookie("mustemmer_session_id");
    } else throw new APIError("E_SESSION_EXPIRED", "Session expired.");
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

logout.perms = ["L"];

export { logout };
