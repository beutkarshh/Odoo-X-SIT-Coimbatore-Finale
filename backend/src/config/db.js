
const { PrismaClient } = require('@prisma/client');

// Keep a single instance for the process.
const prisma = new PrismaClient();

module.exports = { prisma };


