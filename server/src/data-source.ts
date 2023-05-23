import { DataSource } from "typeorm";
import { entities } from "./entity";
import { config } from "./util";

const pgSource = new DataSource({
  type: "postgres",
  host: config?.postgres?.host ?? "localhost",
  port: config?.postgres?.port ?? 5432,
  username: config?.postgres?.username ?? "test",
  password: config?.postgres?.password ?? "test",
  database: config?.postgres?.database ?? "test",
  synchronize: config?.postgres?.synchronize ?? true,
  // dropSchema: true,
  logging: config?.postgres?.logging ?? false,
  entities: entities,
  migrations: [],
  subscribers: [],
});

const liteSource = new DataSource({
  type: "sqlite",
  database: config?.sqlite3?.dbpath ?? "./transres.db",
  entities: entities,
  logger: config?.postgres?.logger ?? "debug",
  synchronize: config?.sqlite3?.synchronize ?? true,
  // dropSchema: true,
});

let conn: DataSource;
switch (config.data_source) {
  case "postgres":
    conn = pgSource;
    break;
  case "sqlite3":
  default:
    conn = liteSource;
    break;
}

export const connection = conn;
