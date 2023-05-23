import { Request, Response } from "express";
import { Like } from "typeorm";
import { connection } from "../data-source";
import { Admin, Session } from "../entity";
import { APIResponse, APIError } from "../util";

export default async function login(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  try {
    if (params.username && params.password) {
      let user = await connection.manager.findOneBy(Admin, {
        username: Like(params.username),
      });
      if (!user)
        throw new APIError(
          "E_USER_NOTEXIST",
          "Specified username does not exist."
        );
      if (user.checkPW(params.password)) {
        // Auth passed
        let session = new Session({
          user,
          userAgent: req.headers["user-agent"],
        });
        await connection.manager.insert(Session, session);
        res.cookie("mustemmer_session_id", session.id);
      } else throw new APIError("E_AUTH_FAILED", "Authentication failed.");
    } else
      throw new APIError(
        "E_FIELD_REQUIRED",
        "Username and password are required."
      );
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

login.perms = [];

export { login };
