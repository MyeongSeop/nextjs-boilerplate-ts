import { seedCommunity } from "@/lib/community/seed"

async function main() {
  await seedCommunity()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
