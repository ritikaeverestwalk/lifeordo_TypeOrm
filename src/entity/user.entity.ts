import { UUID } from "node:crypto";
import { text } from "node:stream/consumers";
import {Column, PrimaryGeneratedColumn, Entity, CreateDateColumn} from "typeorm";

@Entity()
    export class User{
        @PrimaryGeneratedColumn("uuid")
        id!: number;

        @Column({type: "text"})
        name!: string;

        @Column({type: "text", unique:true})
        email!: string;

        @Column({type: "text"})
        password!: string;

        @Column({type:"text", nullable: true})
        verifyotp!: string;

        @Column({type:"bigint", nullable: true})
        verifyotpexpiry!: number;

        @Column({type:"boolean", default:true})
        isverified!: string;

        @Column({type:"text", nullable: true})
        resetotp!: string;

        @Column({type:"bigint", nullable: true})
        resetotpexpiry!: number;

        @CreateDateColumn({type:"timestamp"})
        createdat!: Date;

        @Column({type:"boolean", default:true})
        isloggedin!: string;
    }