const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");

const url = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace("mysql://", "mariadb://") : "";
const pool = mariadb.createPool(url);
const adapter = new PrismaMariaDb(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;