import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./config/data-source.js";
import { User } from "./entity/User.js";
import { Tenant } from "./entity/Tenant.js";

async function seed() {
    await AppDataSource.initialize();

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo = AppDataSource.getRepository(User);

    const existingTenant = await tenantRepo.findOne({
        where: { name: "Default Company" },
    });

    let tenant: Tenant;
    if (existingTenant) {
        tenant = existingTenant;
        // console.log("Using existing tenant: Default Company");
    } else {
        tenant = tenantRepo.create({
            name: "Default Company",
            address: "123 Main Street, City, Country",
        });
        await tenantRepo.save(tenant);
        // console.log("Created tenant: Default Company");
    }

    const users = [
        {
            firstName: "Normal",
            lastName: "User",
            email: "user@example.com",
            password: "User1234567890",
            role: "user",
        },
        {
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            password: "admin1234567890",
            role: "admin",
        },
        {
            firstName: "Manager",
            lastName: "User",
            email: "manager@example.com",
            password: "manager1234567890",
            role: "manager",
        },
    ];

    for (const userData of users) {
        const existingUser = await userRepo.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            // console.log(`User ${userData.email} already exists, skipping...`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = userRepo.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            tenant: tenant,
        });

        await userRepo.save(user);
        // console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    await AppDataSource.destroy();
    // console.log("Seeding completed!");
}

// seed().catch(console.error);
seed();
