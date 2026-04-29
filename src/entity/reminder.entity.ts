import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
    export class Reminder{
        @PrimaryGeneratedColumn("uuid")
        id!: number;

        @Column("text")
        title!: string;

        @Column("text")
        description!: string;

        @Column({ type: "date"})
        date!: string;

        @Column({ type: "time"})
        time!: string;

        @Column("text")
        priority!: string;

        @ManyToOne(()=>User)
        @JoinColumn({name: "userid"})
        userid!: number;
    }