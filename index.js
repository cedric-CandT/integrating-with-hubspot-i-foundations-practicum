require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS_TOKEN;
const OBJECT_TYPE = process.env.HUBSPOT_OBJECT_TYPE;
const PROPERTIES = ['name', 'cuisine', 'prep_time_minutes'];

const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
};

// ROUTE 1: homepage - list all custom object records in a table
app.get('/', async (req, res) => {
    const recordsUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;

    try {
        const resp = await axios.get(recordsUrl, {
            headers,
            params: { properties: PROPERTIES.join(',') }
        });
        const data = resp.data.results;
        res.render('homepage', { title: 'Recipes | Integrating With HubSpot I Practicum', data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching custom object records');
    }
});

// ROUTE 2: render the form to create a new custom object record
app.get('/update-cobj', async (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// ROUTE 3: handle the form submission, create the record, redirect home
app.post('/update-cobj', async (req, res) => {
    const recordsUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;
    const record = {
        properties: {
            name: req.body.name,
            cuisine: req.body.cuisine,
            prep_time_minutes: req.body.prep_time_minutes
        }
    };

    try {
        await axios.post(recordsUrl, record, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating custom object record');
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
