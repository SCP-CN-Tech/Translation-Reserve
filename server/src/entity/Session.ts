import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { randomBytes } from "crypto";
import { Admin } from ".";

@Entity()
export class Session {
  constructor(params?: { user: Admin; id?: string; userAgent: string }) {
    if (params) {
      this.id = params.id ?? randomBytes(16).toString("hex");
      this.user = params.user;
      this.userId = params.user.id;
      this.userAgent = params.userAgent;
    }
  }

  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Admin, (admin) => admin.activeSessions)
  @JoinColumn({ name: "userId" })
  user: Admin;

  @Column()
  userId: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  expire: Date;
}
