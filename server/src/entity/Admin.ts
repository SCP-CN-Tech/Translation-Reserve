import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { Session, Invite } from ".";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  salt: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => Session, session => session.user)
  activeSessions: Session[];

  @Column({ default: false })
  canGenerateInvite: boolean;

  @OneToMany(() => Invite, invite => invite.owner)
  invites: Invite[];

  checkPW(password: string) {
    let hash = createHash("sha512")
      .update(password)
      .update(this.salt)
      .digest("base64");
    return hash === this.hashedPassword;
  }

  static from(params: { username: string; password: string, canGenerateInvite?: boolean }) {
    let user = new Admin();
    let salt = randomBytes(32).toString("base64");
    let hash = createHash("sha512")
      .update(params.password)
      .update(salt)
      .digest("base64");
    user.username = params.username;
    user.salt = salt;
    user.hashedPassword = hash;
    user.canGenerateInvite = !!params.canGenerateInvite;
    return user;
  }
}
