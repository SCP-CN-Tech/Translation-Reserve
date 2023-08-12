import { Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { connection } from "../data-source";
import { Session, Admin } from "../entity";
import { APIError } from "../util";
import { In } from "typeorm";

export default async function updatePassword(
  params: any,
  req: Request,
  res: Response
) {
  if (!params.username || !params.oldPassword || !params.newPassword) {
    throw new APIError(
      "E_FIELD_REQUIRED",
      "Username and password are required."
    );
  }
  let user = await connection.manager.findOne(Admin, {
    relations: {
      activeSessions: true,
    },
    where: { username: params.username },
  });
  if (!user) throw new APIError("E_USER_NOTEXIST", "User does not exist");
  if (user.checkPW(params.oldPassword)) {
    let salt = randomBytes(32).toString("hex");
    let hash = createHash("sha512")
      .update(params.newPassword)
      .update(salt)
      .digest("hex");
    await connection.manager.update(Admin, user.id, {
      salt,
      hashedPassword: hash,
    });
    if (user.activeSessions) {
      // Invalidate all previous sessions
      await connection.manager.delete(Session, {
        id: In(user.activeSessions.map((v) => v.id)),
      });
    }
  } else throw new APIError("E_WRONG_PW", "Incorrect password.");
}

updatePassword.perms = ["L"];

export { updatePassword };
