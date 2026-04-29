import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn  } from "typeorm";
import { User } from "./user.entity";

@Entity()
     export class Permission{
        @PrimaryGeneratedColumn("uuid")
        id!: string;

        @Column({ type: "text" })
        permission!: string;

        @Column({ type: "timestamp" })
        schedule!: Date;

        @Column({ type: "boolean", default: false })
        is_sent!: boolean;

        @ManyToOne(() => User)
        @JoinColumn({ name: "userid" })
        user!: User;

        @Column({ type: "uuid" })
        userid!: string;

        @Column({ type: "uuid" })
        reminder_id!: string;
     }