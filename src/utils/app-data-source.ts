import {DataSource} from "typeorm";
import dotenv from "dotenv";
import { User } from "#entity/user.entity.js";
import { Reminder } from "#entity/reminder.entity.js";
import { Permission } from "#entity/permission.entity.js";

dotenv.config();

export const myDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username:  process.env.DB_USER,
    password:  process.env.DB_PASSWORD,
    database:  process.env.DB_NAME,
    entities: ["src/entity/*"],
    logging: true,
    synchronize: true,
})