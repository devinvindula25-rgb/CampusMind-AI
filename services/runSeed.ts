import { seedInstitutionalData } from './seedInstitutionalData';

async function run() {
  await seedInstitutionalData();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
