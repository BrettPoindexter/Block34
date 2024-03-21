const { client, createTables, seed } = require('./server/db');

const init = async () => {
    await client.connect();
    console.log('Client Connected!');

    await createTables();
    console.log('Tables Created!');

    await seed();
    console.log('Data Seeded!');
};

init();