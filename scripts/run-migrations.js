import { exec } from "child_process";

function runMigration() {
    exec(
        "NODE_ENV=migration npm run migration:run -- -d src/config/data-source.ts",
        (error, stdout, stderr) => {
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            if (error) {
                console.error(`Error executing migration: ${error.message}`);
                process.exit(1);
            }

            console.log(`Migration output: ${stdout}`);
        },
    );
}

runMigration();
