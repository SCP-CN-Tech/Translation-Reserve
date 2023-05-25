import { Request, Response } from "express";
import { connection } from "../data-source";
import { Reserve, User } from "../entity";
import { APIResponse, APIError, normalizeReserve, unixNamifyUser } from "../util";

export default async function upsert(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  try {
    if (params.data) {
      let data =
        typeof params.data === "string" ? JSON.parse(params.data) : params.data;
      if (!(data instanceof Array)) {
        throw new APIError(
          "E_WRONG_PARAM_VAL_TYPE",
          'Param "data" has to be an Array.'
        );
      }
      let reserves: Reserve[] = [];
      let users: User[] = [];
      let normalized = data.map(v=>normalizeReserve(v));
      for (let i = 0; i < normalized.length; i++) {
        for (const field of ["user", "userWikidotId", "page", "date"]) {
          if (!normalized[i][field])
            throw new APIError(
              "E_FIELD_REQUIRED",
              `Field ${field} is required.`
            );
        }
        let existReserve = await connection.manager.findOne(Reserve, {
          relations: ["user"],
          where: {
            user: {wikidotId: normalized[i].userWikidotId},
            page: normalized[i].page,
            date: new Date(normalized[i].date),
          }
        });
        if (existReserve) {
          /* realistically only these fields needs to be updated */
          existReserve.originWiki = normalized[i].originWiki,
          existReserve.expired = normalized[i].expired;
          reserves.push(existReserve);
        } else {
          let user = await connection.manager.findOne(User, {
            where: {
              wikidotId: normalized[i].userWikidotId,
              unixName: unixNamifyUser(normalized[i].user),
            }
          });
          if (!user) {
            user = users.find(u=>{
              return u.wikidotId == normalized[i].userWikidotId && 
              u.unixName == unixNamifyUser(normalized[i].user)
            });
          }
          if (!user) {
            user = User.from({wikidotId: normalized[i].userWikidotId, name: normalized[i].user});
            users.push(user);
          }
          let reserve = Reserve.from({
            page: normalized[i].page,
            user,
            title: normalized[i].title,
            originWiki: normalized[i].originWiki,
            date: new Date(normalized[i].date),
            expired: normalized[i].expired,
          });
          reserves.push(reserve);
        };
      }
      if (users.length) await connection.manager.save(User, users);
      if (reserves.length) await connection.manager.save(Reserve, reserves);
    }
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

upsert.perms = ["L", "R", "W"];

export { upsert };
