import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fallbackMatches } from "../src/lib/matches";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.admin.upsert({
      where: { email: adminEmail },
      create: {
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "owner"
      },
      update: {
        passwordHash
      }
    });
  }

  for (const match of fallbackMatches) {
    await prisma.match.upsert({
      where: { id: match.id },
      create: {
        id: match.id,
        groupName: match.groupName,
        team1: match.team1,
        team2: match.team2,
        matchDate: new Date(match.matchDate)
      },
      update: {
        groupName: match.groupName,
        team1: match.team1,
        team2: match.team2,
        matchDate: new Date(match.matchDate)
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
