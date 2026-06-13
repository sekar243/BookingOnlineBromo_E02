const bcrypt = require('bcryptjs');

async function test() {
  const hash1 = '$2a$10$R9h/lIPzNgb.aF7o.6bK1eB19Y5c26lZ/R6Uf5Q4K9.z73eZ.yHre';
  const match1 = await bcrypt.compare('admin', hash1);
  console.log('Match with hash1:', match1);

  const newHash = await bcrypt.hash('admin', 10);
  console.log('Generated new hash:', newHash);
  const match2 = await bcrypt.compare('admin', newHash);
  console.log('Match with generated new hash:', match2);
}

test();
