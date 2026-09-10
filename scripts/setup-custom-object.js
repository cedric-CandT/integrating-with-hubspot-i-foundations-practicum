require('dotenv').config();
const axios = require('axios');

const PRIVATE_APP_ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

if (!PRIVATE_APP_ACCESS_TOKEN) {
    console.error('Missing PRIVATE_APP_ACCESS_TOKEN. Copy .env.example to .env and fill it in first.');
    process.exit(1);
}

const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

const SCHEMA_NAME = 'recipes';

const schemaBody = {
    name: SCHEMA_NAME,
    labels: { singular: 'Recipe', plural: 'Recipes' },
    primaryDisplayProperty: 'name',
    secondaryDisplayProperties: ['cuisine', 'prep_time_minutes'],
    searchableProperties: ['name', 'cuisine'],
    requiredProperties: ['name'],
    associatedObjects: ['CONTACT'],
    properties: [
        { name: 'name', label: 'Name', type: 'string', fieldType: 'text' },
        { name: 'cuisine', label: 'Cuisine', type: 'string', fieldType: 'text' },
        { name: 'prep_time_minutes', label: 'Prep Time (Minutes)', type: 'number', fieldType: 'number' }
    ]
};

const sampleRecords = [
    { name: 'Spaghetti Carbonara', cuisine: 'Italian', prep_time_minutes: 20 },
    { name: 'Chicken Adobo', cuisine: 'Filipino', prep_time_minutes: 45 },
    { name: 'Pad Thai', cuisine: 'Thai', prep_time_minutes: 30 }
];

async function getOrCreateSchema() {
    try {
        const resp = await axios.post('https://api.hubapi.com/crm/v3/schemas', schemaBody, { headers });
        console.log(`Created custom object schema "${SCHEMA_NAME}".`);
        return resp.data;
    } catch (error) {
        const isAlreadyExists = error.response && error.response.status === 409;
        if (!isAlreadyExists) throw error;
        console.log(`Schema "${SCHEMA_NAME}" already exists, fetching it instead.`);
        const resp = await axios.get(`https://api.hubapi.com/crm/v3/schemas/${SCHEMA_NAME}`, { headers });
        return resp.data;
    }
}

async function createSampleRecords(objectTypeId) {
    for (const properties of sampleRecords) {
        try {
            await axios.post(
                `https://api.hubapi.com/crm/v3/objects/${objectTypeId}`,
                { properties },
                { headers }
            );
            console.log(`Created record: ${properties.name}`);
        } catch (error) {
            console.error(`Failed to create record "${properties.name}":`, error.response ? error.response.data : error.message);
        }
    }
}

async function main() {
    const schema = await getOrCreateSchema();
    const objectTypeId = schema.objectTypeId;

    console.log('\nSchema ready. objectTypeId:', objectTypeId);
    await createSampleRecords(objectTypeId);

    console.log('\nDone. Add this to your .env file:');
    console.log(`HUBSPOT_OBJECT_TYPE=${objectTypeId}`);
}

main().catch((error) => {
    console.error('Setup failed:', error.response ? error.response.data : error.message);
    process.exit(1);
});
