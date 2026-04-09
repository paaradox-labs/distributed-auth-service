import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant.js";

@Entity({
    name: "users",
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    firstName: string;

    @Column({ type: "varchar", length: 100 })
    lastName: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255, select: false })
    password: string;

    @Column({ type: "varchar", length: 255 })
    role: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant;
}
