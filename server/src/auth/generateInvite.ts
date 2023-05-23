import { Response } from "express";
import { connection } from "../data-source";
import { Invite } from "../entity";
import { APIResponse, APIError, APIRequest } from "../util";

export default async function generateInvite(
  params: any,
  req: APIRequest,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  if (params.usesRemain == 0 || params.usesRemain < -1) {
    throw new APIError(
      "E_VALUE_ERROR",
      "Field usesRemain should not be 0 or less than negative one."
    )
  }

  if (req.user.canGenerateInvite) {
    let inviteParams = {
      admin: req.user,
      expireDate: undefined,
      usesRemain: undefined,
    }
    if (params.expireDate && !isNaN(Date.parse(params.expireDate))) {
      inviteParams.expireDate = new Date(params.expireDate);
    }
    if (!isNaN(params.usesRemain)) {
      inviteParams.usesRemain = params.usesRemain;
    }
    let invite = Invite.from(inviteParams);
    await connection.manager.insert(Invite, invite);

    body.data = {
      code: invite.code,
      expireDate: invite.expireDate.toISOString(),
      usesRemain: invite.usesRemain,
    }
  } else {
    throw new APIError(
      "E_NO_PERMS",
      "You do not have the permission to generate invites."
    )
  }
  res.send(body);
}

generateInvite.perms = ["L"];

export { generateInvite };