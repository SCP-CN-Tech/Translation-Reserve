import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from ".";
import { unixNamify } from "../util";

@Entity()
export class Reserve {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, user => user.reserves)
  user: User;

  @Column()
  page: string;

  @Column({nullable: true})
  title: string;

  @Column({nullable: true})
  originWiki: string;

  @Column()
  date: Date;

  @Column()
  expired: boolean;

  serializeSync() {
    return {
      id: this.id,
      user: this.user.serializeSync(),
      page: this.page,
      title: this.title,
      originWiki: this.originWiki,
      date: this.date.valueOf(),
      expired: this.expired,
    }
  }

  static serializeSync(reserve: Reserve) {
    return {
      id: reserve.id,
      user: User.serializeSync(reserve.user),
      page: reserve.page,
      title: reserve.title,
      originWiki: reserve.originWiki,
      date: reserve.date.valueOf(),
      expired: reserve.expired,
    }
  }

  static from(params: { id?: string, user: User; page: string; title?: string, originWiki?: string; date: Date, expired?: boolean }) {
    let reserve = new Reserve();
    // reserve.id = params.id;
    reserve.user = params.user;
    reserve.page = unixNamify(params.page, { acceptsCategory: true });
    reserve.title = params.title ?? null;
    reserve.originWiki = params.originWiki ?? null;
    reserve.date = params.date;
    reserve.expired = params.expired ?? false;
    return reserve;
  }
}
