const uuid = require('uuid');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner_db');

const createTables = async() => {
    const SQL = /*SQL*/ `
        DROP TABLE IF EXISTS reservation;
        DROP TABLE IF EXISTS customer;
        DROP TABLE IF EXISTS restaurant;

        CREATE TABLE customer(
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
        CREATE TABLE restaurant(
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
        CREATE TABLE reservation(
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            party_count INTEGER NOT NULL DEFAULT 1,
            restaurant_id UUID REFERENCES restaurant(id) NOT NULL,
            customer_id UUID REFERENCES customer(id) NOT NULL
        );
    `;

    const response = await client.query(SQL);
    return response;
};

const createCustomer = async(name) => {
    const SQL = /*SQL*/ `INSERT INTO customer(id, name) VALUES($1, $2) RETURNING *;`;

    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createRestaurant = async(name) => {
    const SQL = /*SQL*/ `INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *;`;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const fetchCustomer = async() => {
    const SQL = /*SQL*/ `SELECT * FROM customer;`;

    const response = await client.query(SQL);
    return response.rows;
};

const fetchRestaurant = async() => {
    const SQL = /*SQL*/ `SELECT * FROM restaurant;`;

    const response = await client.query(SQL);
    return response.rows;
};

const fetchReservation = async() => {
    const SQL = /*SQL*/ `SELECT * FROM reservation`;
    const response = await client.query(SQL);
    return response.rows;
};

const createReservation = async({ customer_id, restaurant_id, date })=> {
    const SQL = /*sql*/ `
        INSERT INTO reservation(id, customer_id, restaurant_id, date)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), customer_id, restaurant_id, date]);
    return response.rows[0];
};

const destroyReservation = async ({ id, customer_id }) => {
        const SQL = /*SQL*/ `DELETE FROM reservation WHERE id = $1 AND customer_id = $2;`;
        const result = await client.query(SQL, [id, customer_id]);
};

const seed = async () => {
    const brett = await createCustomer('Brett');
    const meagan = await createCustomer('Meagan');
    const pizza_hut = await createRestaurant('Pizza Hut');
    const taco_bell = await createRestaurant('Taco Bell');

    console.log('Customers are: ', await fetchCustomer());
    console.log('Restaurants are: ', await fetchRestaurant());

    const [reservation1, reservation2] = await Promise.all([
        createReservation({
            customer_id: brett.id,
            restaurant_id: pizza_hut.id,
            date: '2024-03-21'
        }),
        createReservation({
            customer_id: meagan.id,
            restaurant_id: taco_bell.id,
            date: '2024-03-12'
        })
    ]);
    
};

module.exports = {
    client,
    createTables,
    fetchCustomer,
    fetchRestaurant,
    fetchReservation,
    createReservation,
    seed
}