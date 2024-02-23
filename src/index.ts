import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import axios from 'axios';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.disable('x-powered-by');

app.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        if (response.statusText!='OK') {
            throw new Error(response.statusText);
        }
        const productsData = response.data;
        //console.log(productsData);
        console.log("start seeding");
        for (const p of productsData) {
            const product = await prisma.products.create({
                data: {
                    title: p.title,
                    price: p.price,
                    description: p.description,
                    category: p.category,
                    image: p.image,
                    sold: p.sold,
                    dateOfSale: p.dateOfSale
                }
            });
            console.log(`Created product with id ${product.id}`);
        }
        console.log('seeding finished');
        res.send('Database seeded successfully');
    } catch (error) {
        console.error("Error seeding database",error);
        res.status(500).send('Error seeding database');
    }
});

app.listen(port, () => {
    console.log('Server is running on localhost:3000');
});