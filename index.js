const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8yl3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('online_shop');
        //  shob product aikhane rakha ase
        const productCollection = database.collection('products');
        // order collection
        const orderCollection = database.collection('orders');

        // GET PRODUCT API 
        app.get('/products', async (req, res) => {
            console.log(req.query)

            // async thakle must await dite hbe 
            // find er vitor empty object for getting all product
            // toArray dise array akare pawar jnno
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }




            res.send({
                count,
                products
            });


        });
        // use post to get keys
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.json(products);

        })
        // add orders api 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })



    }
    finally {
        // await client.close();
    }


}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send("running server");
})

app.listen(port, () => {
    console.log('ema jhon', port)
})