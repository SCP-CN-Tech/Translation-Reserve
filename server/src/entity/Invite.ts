import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { Session, Admin } from ".";


@Entity()
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(()=> Admin, admin => admin.invites)
  owner: Admin;

  @Column()
  code: string;

  @Column({ nullable: true })
  expireDate: Date;

  @Column()
  expired: boolean;

  @Column()
  usesRemain: number;

  static from(params: {admin: Admin, usesRemain?: number, expireDate?: Date}) {
    let invite = new Invite;
    invite.owner = params.admin;
    let salt = randomBytes(32).toString("base64");
    let expireDate = params.expireDate ?? new Date(Date.now() + 1000 * 3600 * 24 * 7); // default to one week
    let hash = createHash("sha512")
      .update(salt)
      .update(expireDate.toString())
      .digest("base64");
    invite.code = hash.substring(0, 8);
    invite.usesRemain = params.usesRemain ?? 1;
    invite.expireDate = expireDate;
    invite.expired = false;
    return invite;
  }
}