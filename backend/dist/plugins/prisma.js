"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaPlugin = prismaPlugin;
require("dotenv/config");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const client_1 = require("../../generated/prisma/client");
async function prismaPlugin(fastify) {
    const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? "file:./dev.db",
    });
    const prisma = new client_1.PrismaClient({ adapter });
    fastify.decorate("prisma", prisma);
    fastify.addHook("onClose", async () => {
        await prisma.$disconnect();
    });
}
