import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Reserve } from ".";
import { unixNamifyUser } from "../util";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  wikidotId: number;

  @Column()
  name: string;

  @Column()
  unixName: string;

  @OneToMany(() => Reserve, reserve => reserve.user)
  reserves: Reserve[];

  serializeSync() {
    return {
      id: this.id,
      wikidotId: this.wikidotId,
      name: this.name,
      unixName: this.unixName,
    }
  }

  static serializeSync(user: User) {
    return {
      id: user.id,
      wikidotId: user.wikidotId,
      name: user.name,
      unixName: user.unixName,
    }
  }

  static from(params: { wikidotId: number, name: string }) {
    let user = new User();
    user.wikidotId = params.wikidotId;
    user.name = params.name;
    user.unixName = unixNamifyUser(params.name);
    return user;
  }
}
