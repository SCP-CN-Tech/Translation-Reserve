import { Request, Response } from "express";
import { Like } from "typeorm";
import { connection } from "../data-source";
import { Reserve, User } from "../entity";
import { APIResponse, unixNamifyUser, normalizeSearch } from "../util";

export default async function search(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  let normalized = normalizeSearch(params);
  let limit =
    typeof params.limit === "number" && !isNaN(params.limit)
      ? Math.abs(parseInt(params.limit))
      : 50;
  let page =
    typeof params.page === "number" && !isNaN(params.page)
      ? Math.abs(parseInt(params.page))
      : 1;
  let dbquery = connection.manager
    .createQueryBuilder(Reserve, "reserve")
    .select()
    .take(limit)
    .skip((page - 1) * limit);

  if (normalized.page) {
    dbquery = dbquery.andWhere(`reserve.page LIKE :page`, {page: `%${normalized.page}%`});
  }
  if (normalized.title) {
    dbquery = dbquery.andWhere(`reserve.title LIKE :title`, {title: normalized.title});
  }
  if (normalized.originWiki) {
    dbquery = dbquery.andWhere(`reserve.originWiki = :originWiki`, {originWiki: normalized.originWiki});
  }

  if (normalized.userWikidotId) {
    let conditions: string[] = [ `user.wikidotId = :userId` ];
    let dbqParams: any = { userId: normalized.userWikidotId };
    if (normalized.user) {
      conditions.push(`user.unixName LIKE "%${unixNamifyUser(normalized.user)}%"`)
    }
    dbquery = dbquery.innerJoinAndSelect(
      "reserve.user",
      "user",
      `(${conditions.join(` AND `)})`,
      dbqParams
    );
  }

  if (normalized.user && !normalized.userWikidotId) {
    let users = await connection.manager.find(User, {
      where: { unixName: Like(`%${unixNamifyUser(normalized.user)}%`) }
    });
    let conditions: string[] = [];
    let dbqParams: any = {};
    if (users.length) {
      for (let i = 0; i < users.length; i++) {
        conditions.push(`user.wikidotId = :userId${i}`);
        dbqParams[`userId${i}`] = users[i].wikidotId;
      }
      dbquery = dbquery.innerJoinAndSelect(
        "reserve.user",
        "user",
        `(${conditions.join(` OR `)})`,
        dbqParams
      );
    } else {
      // fall back to name search for completeness, but it should return no result
      dbquery = dbquery.innerJoinAndSelect(
        "reserve.user",
        "user",
        `user.unixName LIKE "%${unixNamifyUser(normalized.user)}%"`
      )
    }
  }
  
  if (!normalized.user && !normalized.userWikidotId) {
    dbquery = dbquery.leftJoinAndSelect("reserve.user", "user");
  }

  dbquery = dbquery.addOrderBy("reserve.date", "DESC");

  // console.log(dbquery.getQueryAndParameters())

  let [reserve, count] = await dbquery.getManyAndCount();
  body.data = { data: reserve.map((s) => s.serializeSync()), count };
  res.send(body);
}

search.perms = ["R"];

export { search };
