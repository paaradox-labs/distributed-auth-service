import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem");

const jwk = rsaPemToJwk(
    privateKey,
    {
        use: "sig",
    },
    "public",
);

fs.writeFileSync("public/.well-known/jwks.json", JSON.stringify({ keys: [jwk] }, null, 2));
