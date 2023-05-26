import { resolve } from "path";
import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { Request, Response, NextFunction } from "express";
import { Admin } from "./entity";

export const config: any = yaml.load(
  readFileSync(resolve(__dirname, "../config.yaml"), "utf8")
);

/**
 * Represents a response from the API.
 */
export interface APIResponse {
  status: string;
  data?: any;
  message?: string;
  error?: string;
}

export interface APIError extends Error {
  status: string;
}

export class APIError extends Error implements APIError {
  constructor(status: string, msg: string) {
    super(msg);
    this.status = status;
  }
}
export interface APIRequest extends Request {
  user: Admin,
}

export interface HandlerFunction {
  (params: any, req: Request, res: Response, next: NextFunction): any;
  perms: string[];
}

export const wikis = [
  {
    name: "被放逐者之图书馆",
    site: "http://wanderers-library.wikidot.com",
  },
  {
    name: "英语（EN）",
    site: "http://scp-wiki.wikidot.com",
  },
  {
    name: "国际站（INT）",
    site: "http://scp-int.wikidot.com",
  },
  {
    name: "俄语（RU）",
    site: "http://scpfoundation.net",
  },
  {
    name: "韩语（KO）",
    site: "http://scpko.wikidot.com",
  },
  {
    name: "法语（FR）",
    site: "http://foundationscp.wikidot.com",
  },
  {
    name: "波兰语（PL）",
    site: "http://scp-pl.wikidot.com",
  },
  {
    name: "西班牙语（ES）",
    site: "http://scp-es.wikidot.com",
  },
  {
    name: "泰语（TH）",
    site: "http://scp-th.wikidot.com",
  },
  {
    name: "日语（JP）",
    site: "http://scp-jp.wikidot.com",
  },
  {
    name: "德语（DE）",
    site: "http://scp-wiki-de.wikidot.com",
  },
  {
    name: "意大利语（IT）",
    site: "http://foudazionescp.wikidot.com",
  },
  {
    name: "乌克兰语（UA）",
    site: "http://scp-ukrainian.wikidot.com",
  },
  {
    name: "葡萄牙语（PT）",
    site: "http://scp-pt-br.wikidot.com",
  },
  {
    name: "捷克语（CZ）",
    site: "http://scp-cs.wikidot.com",
  },
  {
    name: "其他/非官方分部",
    site: "",
  },
]

/**
 * Turns a string into Wikidot-standard unix names.
 * @param name The string to be unix-namified.
 * @param options
 * @returns string
 */
export function unixNamify (
  name: string,
  options?: {
    /**
     * Accepts category or not. Default false.
     */
    acceptsCategory?: boolean,
    /**
     * If accepting category, what sequence of characters to replace colon.
     * Default /~+/g.
     */
    colonReplacer?: string | RegExp
  }): string {
  let acceptsCategory: boolean = options?.acceptsCategory ?? false;
  let colonReplacer: string | RegExp = options?.colonReplacer ?? /~+/g;
  let output = name.trim().toLowerCase();
  if (acceptsCategory) {
    output = output.replace(new RegExp(colonReplacer), ":")
      .replace(/[^\:\w]+/g, "-")
      .split(":")
      .map(el => el.split("_")
          .map((v,i)=>v.replace(/^\-|\-$/g, "")||(i==0?"_":""))
          .filter(v=>!!v)
          .join(""))
      .filter(v=>!!v&&v!="_")
      .join(":");
  } else {
    output = output.replace(/[^a-z0-9]+/g, "-").replace(/^\-+|\-+$/g, "");
  }
  return output;
}

export function unixNamifyUser(name: string) {
  return name.toLowerCase()=="(user deleted)" ? name.toLowerCase() : unixNamify(name);
}

export interface NormalizedSearch {
  page?: string,
  user?: string,
  userWikidotId?: number,
  originWiki?: string,
  title?: string,
  date?: number,
  expired?: boolean,
}
export interface Normalized {
  page: string,
  user: string,
  userWikidotId: number,
  originWiki: string,
  title?: string,
  date: number,
  expired?: boolean,
}
/**
 * This function tries to normalize an object into a reserve info with expected properties.
 * @param info Object to be normalized
 */
export function normalizeReserve(info: any) {
  let normalized: Normalized = {
    page: "",
    user: "",
    userWikidotId: NaN,
    originWiki: "",
    title: "",
    date: NaN,
    expired: false,
  };
  if (info.wikipage) normalized.page = unixNamify(info.wikipage, {acceptsCategory: true, colonReplacer: ":"});
  if (info.user) normalized.user = info.user;
  if (info.userWikidotId) normalized.userWikidotId = info.userWikidotId;
  if (info.originWiki) normalized.originWiki = info.originWiki;
  if (info.title) normalized.title = info.title;
  if (info.date) normalized.date = info.date;
  if (info.expired) normalized.expired = !!info.expired;

  return normalized;
}
/**
 * This function tries to normalize an object containing search params.
 * @param info Object to be normalized
 */
export function normalizeSearch(info: any) {
  let normalized: NormalizedSearch = {};
  if (info.wikipage) normalized.page = unixNamify(info.wikipage, {acceptsCategory: true, colonReplacer: ":"});
  if (info.user) normalized.user = info.user;
  if (info.userWikidotId) normalized.userWikidotId = info.userWikidotId;
  if (info.originWiki) normalized.originWiki = info.originWiki;
  if (info.title) normalized.title = info.title;
  if (info.date) normalized.date = info.date;
  if (info.expired) normalized.expired = !!info.expired;

  return normalized;
}