const {     
    client,
    createTables,
    fetchCustomer,
    fetchRestaurant,
    fetchReservation,
    createReservation,
    seed } = require('./server/db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers', async(req, res, next) => {
    try {
        res.send(await fetchCustomer());
    } catch (err) {
        next(err);
    }
});

app.get('/api/restaurants', async(req, res, next) => {
    try {
        res.send(await fetchRestaurant());
    } catch (err) {
        next(err);
    }
});

app.get('/api/reservations', async(req, res, next) => {
    try {
        res.send(await fetchReservation());
    } catch (err) {
        next(err);
    }
});

app.post('/api/customers/:id/reservations', async(req, res, next) => {
    try {
        res.status(201).send(await createReservation({
            customer_id: req.body.customer_id,
            restaurant_id: req.body.restaurant_id,
            date: req.body.date
        }));
    } catch (err) {
        next(err);
    }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
    try {
        await destroyReservation({id: req.params.id, customer_id: req.body.customer_id});
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

const init = async () => {
    await client.connect();
    console.log('Client Connected!');

    await createTables();
    console.log('Tables Created!');

    await seed();
    console.log('Data Seeded!');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {console.log(`Listening on port ${port}!`);})
};

init();

