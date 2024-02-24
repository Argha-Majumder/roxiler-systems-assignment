import express from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Product } from "./types";
import { getBarChartData, getPieChartData, getSalesData } from "./utils";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.disable("x-powered-by");

app.get("/initialize", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    if (response.statusText != "OK") {
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
          dateOfSale: p.dateOfSale,
        },
      });
      console.log(`Created product with id ${product.id}`);
    }
    console.log("seeding finished");
    res.send("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database", error);
    res.status(500).send("Error seeding database");
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

app.get("/products/:month", async (req, res) => {
  const { month } = req.params;
  const { page = 1, limit = 10, search } = req.query;

  try {
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;
    const searchString = search || "";

    let products;
    if (searchString) {
      products =
        await prisma.$queryRaw`SELECT * FROM "Products" WHERE (("title" ILIKE '%'||${searchString}||'%' OR "description" ILIKE '%'||${searchString}||'%' OR "price" ILIKE '%'||${searchString}||'%') AND EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)) OFFSET ${offset} LIMIT ${limitNumber}`;
    } else {
      products =
        await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER) OFFSET ${offset} LIMIT ${limitNumber}`;
    }

    res.json(products);
  } catch (err) {
    console.error("Error fetching data", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/stat/:month", async (req, res) => {
  const { month } = req.params;

  try {
    const products: Product[] =
      await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
    let salesData = getSalesData(products);
    res.json(salesData);
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/bar-chart/:month", async (req, res) => {
  const { month } = req.params;

  try {
    const products: Product[] =
      await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
    let barChartData = getBarChartData(products);
    res.json(barChartData);
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/pie-chart/:month", async (req, res) => {
  const { month } = req.params;

  try {
    const products: Product[] =
      await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;
    let pieChartData = getPieChartData(products);
    res.json(pieChartData);
  } catch (err) {
    console.error("Error fetching data", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/combined-data/:month", async (req, res) => {
  const { month } = req.params;
  try {
    const products: Product[] =
      await prisma.$queryRaw`SELECT * FROM "Products" WHERE EXTRACT(MONTH FROM "dateOfSale") = CAST(${month} AS INTEGER)`;

    const combinedData = {
      stat: getSalesData(products),
      barChart: getPieChartData(products),
      pieChart: getPieChartData(products),
    };

    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data", error);
    res.status(500).send("Error fetching combined data");
  }
});

app.listen(port, () => {
  console.log("Server is running on localhost:3000");
});