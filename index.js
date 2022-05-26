const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a37vj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partCollection = client.db('saltburn-auto').collection('parts');
        const orderCollection = client.db('saltburn-auto').collection('orders');
        const userCollection = client.db('saltburn-auto').collection('users');

        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token });
        })

        app.get('/available', async (req, res) => {
            const query = {};
            const products = await partCollection.find(query).toArray();
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();

            products.forEach(product => {
                const productOrders = orders.filter(o => o.part === product.name);
                const ordered = productOrders.map(q => q.quantity);
                const arrOfOrdered = ordered.map(str => {
                    return Number(str);
                })
                let sum = 0;
                for (let num of arrOfOrdered) {
                    sum = sum + num;
                }
                product.ordered = sum;
                const available = product.available - sum;
                console.log(available);
                product.available = available;
            })

            res.send(products);
        })

        app.get('/order', async (req, res) => {
            const buyer = req.query.buyer;
            const query = { buyer: buyer };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = orderCollection.insertOne(order);
            res.send({ success: true, result });
        })
    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Saltburn Auto Solution!')
})

app.listen(port, () => {
    console.log(`Saltburn auto solution app listening on port ${port}`)
})