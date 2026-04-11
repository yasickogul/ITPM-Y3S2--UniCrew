const bcrypt = require("bcrypt");

async function hashPassword() {
    const password = "user123"; // your admin password

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed Password:");
    console.log(hashedPassword);
}

hashPassword();