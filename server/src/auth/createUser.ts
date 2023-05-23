import { Request, Response } from "express";
import { connection } from "../data-source";
import { Invite, Session, Admin } from "../entity";
import { APIResponse, APIError } from "../util";

export default async function createUser(
  params: any,
  req: Request,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  if (!params.username || !params.password) {
    throw new APIError(
      "E_FIELD_REQUIRED",
      "Username and password are required."
    );
  }
  let isFirstUser = (await connection.manager.createQueryBuilder(Admin, "admin").take(1).getOne()) == null;
  if (!isFirstUser && !params.invite) {
    throw new APIError(
      "E_FIELD_REQUIRED",
      "Invite code is required."
    );
  }

  /* Check if usename is taken */
  let q = await connection.query(
    `SELECT EXISTS( SELECT 1 FROM "admin" "admin" WHERE "admin"."username" LIKE $1 )`,
    [params.username]
  );
  if (q[0].exists)
    throw new APIError("E_USERNAME_TAKEN", "Username is already taken.");

  /* Check if the invite link is valid for any user that is not the first */
  if (!isFirstUser) {
    let invite = await connection.manager.findOne(Invite, {
      where: {
        code: params.invite,
        expired: false,
      }
    });
    if (invite == null) {
      throw new APIError(
        "E_INVITE_INVALID",
        "Invite code is invalid."
      );
    }
    if (invite.expireDate?.getTime() <= Date.now()) {
      await connection.manager.update(Invite, {
        code: params.invite,
        expired: false,
        expireDate: invite.expireDate,
        usesRemain: invite.usesRemain,
      }, { expired: true });
      throw new APIError(
        "E_INVITE_EXPIRED",
        "Invite code is expired."
      );
    }
    if (invite.usesRemain != -1) {
      await connection.manager.update(Invite, {
        code: params.invite,
        expired: false,
        expireDate: invite.expireDate,
        usesRemain: invite.usesRemain,
      }, {
        usesRemain: invite.usesRemain-1,
        expired: invite.usesRemain-1 == 0,
      });
    }
  }
  
  /* Acutally create user */
  let admin = Admin.from({
    username: params.username,
    password: params.password,
    canGenerateInvite: isFirstUser,
  });
  await connection.manager.insert(Admin, admin);

  /* Automatic login to create user for current session */
  let session = new Session({ user: admin, userAgent: req.headers["user-agent"] });
  await connection.manager.insert(Session, session);

  res.cookie("mustemmer_session_id", session.id);
  res.send(body);
}

createUser.perms = [];

export { createUser };
