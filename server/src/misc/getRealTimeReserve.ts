import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { load } from "cheerio";
import { unixNamify } from "../util";

export default async function getRealTimeReserve(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let page = unixNamify(req.params.pageName);
  let wikidotToken7 = Math.random().toString(36).substring(4);
  let params = {
    wikidot_token7: wikidotToken7,
    callbackIndex: 0,
    moduleName: "list/ListPagesModule",
    category: "reserve",
    name: page.substring(0,52),
    order: "created_at desc",
    seaparate: "false",
    module_body: `
    [[div_ id="created_by"]]
    [[a href="https://www.wikidot.com/user:info/%%created_by_unix%%" target="_parent"]]%%created_by%%[[/a]]
    [[/div]]
    [[div_ id="created_at"]]
    %%created_at|%Y-%m-%d|hover%%
    [[/div]]`
  }
  let fetchbody = new URLSearchParams();
  for (const key in params) { fetchbody.append(key, params[key]) }
  let body = await (await fetch("http://scp-tech-cn.wikidot.com/ajax-module-connector.php", {
    method: "POST",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      Referer: 'Translation Reservation for SCP-CN',
      Cookie: `wikidot_token7=${wikidotToken7};`,
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: fetchbody,
  })).json();
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin ?? "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Cookie",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": true,
    "Content-Type": "text/html",
  });
  let text = `<style>
    .transres-msg {
      text-align: center;
    }
    h1 {
      color: #901;
      font-weight: bold;
      font-size: 130%;
    }
    a {
      color: #b01;
      text-decoration: none;
    }
    a:hover {
      background-color: transparent;
      text-decoration: underline;
    }
  </style>`;
  if (body.status!="ok") {
    text += `<div class="transres-msg">Wikidot error ${body.status}: ${body.message}</div>`;
  } else {
    // console.log(body)
    let $ = load(body.body);
    // console.log($(".list-pages-box").html())
    if (!$(".list-pages-box").html()?.trim()) {
      text += `<div class="transres-msg"><h1>沒有找到相關翻譯預定</h1></div>`;
    } else {
      // res.send(body.body)
      // console.log($("#u-created_at").children("span").attr('class'))
      let time = new Date(parseInt($("#u-created_at").children("span").attr('class').split(' ')[1].substring(5)+'000'));
      text += `<div class="transres-msg">
        <h1>此頁已被預定翻譯</h1>
        由 ${$("#u-created_by").html()} 於 ${time.getFullYear()}-${("0"+(time.getMonth()+1)).slice(-2)}-${("0"+time.getDate()).slice(-2)}
      </div>`;
    }
  }
  res.send(text);
}

getRealTimeReserve.path = "/getRealTime/:pageName";

export { getRealTimeReserve };
