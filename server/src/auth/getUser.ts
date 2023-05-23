import { Request, Response } from "express";
import { connection } from "../data-source";
import { Session, User } from "../entity";
import { APIResponse, APIError } from "../util";

export default async function getUser(
  params: any,
  req: Request,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  let sessionId = req.cookies?.mustemmer_session_id;
  if (sessionId) {
    let session = await connection.manager.findOne(Session, {
      relations: ["user"],
      where: { id: sessionId },
    });
    if (!session || session.userAgent !== req.headers["user-agent"]) {
      res.clearCookie("mustemmer_session_id");
      body.data = { sessionValid: false };
    } else {
      body.data = {
        sessionValid: true,
        username: session.user.username,
      };
    }
  } else body.data = { sessionValid: false };

  res.send(body);
}

getUser.perms = [];

export { getUser };
