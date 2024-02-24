import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient,Prisma } from "@prisma/client";
import axios from 'axios';
import { Product } from './types';

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

/*app.get('/products/:month', async (req, res) => {
    const { month } = req.params;
    try {
        // Convert page and limit to numbers
        const pageNumber = parseInt(page as string,  10);
        const limitNumber = parseInt(limit as string,  10);

        // Calculate the offset for pagination
        const offset = (pageNumber -  1) * limitNumber;
        const searchString = search as string;
        let products;
        if (searchString && searchString!=='') {
            products = await prisma.products.findMany({
                skip: offset,
                take: limitNumber,
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchString,
                                mode: 'insensitive'
                            }
                        },
                        {
                            description: {
                                contains: searchString,
                                mode: 'insensitive'
                            }
                        },
                        {
                            price: {
                                contains: searchString,
                            }
                        },
                    ]
                }
            });
        } else {
            products = await prisma.products.findMany({
                skip: offset,
                take: limitNumber,
                where: {
                    dateOfSale: {
                        dateOfSale: {
                            equals: new Date(`${new Date().getFullYear()}-${month}-01`),
                            mode: Prisma.DateTimeFilterMode.Month,
                        },
                    }
                }
            });
        }
        const products = await prisma.products.findMany({});
        const filteredProducts = products.filter(product => {
            const saleDate = new Date(product.dateOfSale);
            return saleDate.getMonth()+1===parseInt(month, 10);
        });
        res.json(filteredProducts);
    } catch (err) {
        console.error("Error fetching data", err);
        res.status(500).send('Error fetching data');
    }
});*/

app.get('/products/:month', async (req, res) => {
    const { month } = req.params;
    const { page =  1, limit =  10, search } = req.query;
  
    try {
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const offset = (pageNumber - 1) * limitNumber;
        const searchString = search || '';

        let products;
        if (searchString) {
            products = await prisma.$queryRaw`SELECT * FROM "Products" WHERE (("title" ILIKE '%'||${searchString}||'%' OR "description" ILIKE '%'||${searchString}||'%' OR "price" ILIKE '%'||${searchString}||'%') AND EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)) OFFSET ${offset} LIMIT ${limitNumber}`;
        } else {
            products = await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER) OFFSET ${offset} LIMIT ${limitNumber}`;
        }

        res.json(products);
    } catch (err) {
        console.error("Error fetching data", err);
        res.status(500).send('Error fetching data');
    }
});  

app.get('/stat/:month', async (req, res) => {
    const { month } = req.params;

    try {
        const products: Product[] = await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
        let saleAmount: number = 0;
        let soldItems: number = 0;
        let notSoldItems: number = 0;
        for (const p of products) {
            if (p.sold) {
                soldItems++;
                saleAmount += parseFloat(p.price);
            } else {
                notSoldItems++;
            }
        }
        let obj = {
            "total sale": saleAmount,
            "number of sold items": soldItems,
            "number of not sold items": notSoldItems
        }
        res.json(obj);
    } catch (error) {
        console.error("Error fetching data",error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/bar-chart/:month', async (req, res) => {
    const { month } = req.params;
    
    try {
        const products: Product[] = await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
        let obj = {
            "0-100": 0,
            "101-200": 0,
            "201-300": 0,
            "301-400": 0,
            "401-500": 0,
            "501-600": 0,
            "601-700": 0,
            "701-800": 0,
            "801-900": 0,
            "901-above": 0,
        }
        
        for (const p of products) {
            let price = parseFloat(p.price);
            if (price >=0 && price<=100) {
                obj['0-100']++;
            } else if (price>=101 && price<=200) {
                obj['101-200']++;
            } else if (price>=201 && price<=300) {
                obj['201-300']++;
            } else if (price>=301 && price<=400) {
                obj['301-400']++;
            } else if (price>=401 && price<=500) {
                obj['401-500']++;
            } else if (price>=501 && price<=600) {
                obj['501-600']++;
            } else if (price>=601 && price<=700) {
                obj['601-700']++;
            } else if (price>=701 && price<=800) {
                obj['701-800']++;
            } else if (price>=801 && price<=900) {
                obj['801-900']++;
            } else {
                obj['901-above']++;
            }
        }
        res.json(obj);
    } catch (error) {
        console.error('Error fetching data',error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/pie-chart/:month', async (req, res) => {
    const { month } = req.params;
    
    try {
        const products: Product[] = await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
        let obj: {[key: string]: number} = {};
        for (const p of products) {
            if (Object.keys(obj).includes(p.category)) {
                obj[p.category]++;
            } else {
                obj[p.category] = 1;
            }
        }
        res.json(obj);
    } catch (err) {
        console.error('Error fetching data', err);
        res.status(500).send('Error fetching data');
    }
});

app.get('/combined-data/:month', async (req, res) => {
    const { month } = req.params;

    try {
        const [statData, barChartData, pieChartData] = await Promise.all([
            axios.get(`http://localhost:${port}/stat/${month}`),
            axios.get(`http://localhost:${port}/bar-chart/${month}`),
            axios.get(`http://localhost:${port}/pie-chart/${month}`),
        ]);

        const combinedData = {
            stat: statData.data,
            barChart: barChartData.data,
            pieChart: pieChartData.data
        };

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching combined data', error);
        res.status(500).send('Error fetching combined data');
    }
});

app.listen(port, () => {
    console.log('Server is running on localhost:3000');
});