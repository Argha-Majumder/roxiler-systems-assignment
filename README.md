# Roxiler Systems Assignment

This API allows users to initialize the database, get datas related to transactions, statistics of sold items and not sold items. It's built using Node.js with Prisma and PostgreSQL for the database.

## Getting Started 🚀

### Prerequisites:

- Node.js and npm installed on your machine
- An account on [ElephantSQL](https://www.elephantsql.com) for PostgreSQL as a database
- A 3rd party [API](https://s3.amazonaws.com/roxiler.com/product_transaction.json) for fetching data

### Setting Up:

1. **Clone the Repository**:
    ```
    git clone https://github.com/Argha-Majumder/roxiler-systems-assignment.git
    cd roxiler-systems-assignment
    ```

2. **Setting up the Backend**:
    - Install the necessary packages:
    ```
    npm install
    ```

    - **ElephantSQL Setup**:
        - Create a new database instace on ElephantSQL
        - Copy the connection string provided by ElephantSQL.
    
    - **Prisma Setup**:
        - Replace the `DATABASE_URL` in the `.env` file with your ElephantSQL connection string.
        - Initialize Prisma and generate the Prisma client:

        ```
        npx prisma init
        npx prisma generate
        ```
    
    - Start the backend server:
    ```
    npm start
    ```

### Endpoints:

### GET
It fetch the JSON from the third party API and
initialize the database with seed data.

#### Example Request
```
GET http://localhost:3000/initialize
```
#### Example Response
```
Database seeded successfully
```
**N.B.** : All the APIs below take month ( expected value is any month between
January to December) as an input and should be matched against the field
dateOfSale regardless of the year.

### GET
API support search and pagination on product transactions
- Based on the value of search parameters, it should match search text on product
title/description/price and based on matching result it should return the product
transactions
- If search parameter is empty then based on applied pagination it should return all the
records of that page number
- Default pagination values will be like page = 1, per page = 10

#### Example Request
```
GET http://localhost:3000/products/7?search=usb&page=1&limit=10
```
#### Example Response
```
[
  {
    "id": "a2b33d17-cc7c-4567-aa6f-5ebe6ab87d81",
    "title": "Mens Cotton Jacket",
    "price": "615.89",
    "description": "great outerwear jackets for SpringAutumnWinter suitable for many occasions such as working hiking camping mountainrock climbing cycling traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father husband or son in this thanksgiving or Christmas Day.",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    "sold": true,
    "dateOfSale": "2022-07-27T14:59:54.000Z"
  },
  {
    "id": "593eba00-9077-4696-8875-9c40a61cf3a3",
    "title": "WD 2TB Elements Portable External Hard Drive  USB 30 ",
    "price": "704",
    "description": "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity Compatibility Formatted NTFS for Windows 10 Windows 8.1 Windows 7 Reformatting may be required for other operating systems Compatibility may vary depending on users hardware configuration and operating system",
    "category": "electronics",
    "image": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    "sold": true,
    "dateOfSale": "2022-07-27T14:59:54.000Z"
  }
]
```


### GET
An API for statistics
- Total sale amount of selected month
- Total number of sold items of selected month
- Total number of not sold items of selected month
#### Example Request
```
GET http://localhost:3000/stat/6
```
#### Example Response
```
{
  "total sale": 7699.3,
  "number of sold items": 4,
  "number of not sold items": 6
}
```


### GET
An API for bar chart which contain price range and the number
of items in that range for the selected month regardless of the year

#### Example Request
```
GET http://localhost:3000/bar-chart/6
```
#### Example Response
```
{
  "0-100": 3,
  "101-200": 1,
  "201-300": 0,
  "301-400": 0,
  "401-500": 0,
  "501-600": 2,
  "601-700": 1,
  "701-800": 0,
  "801-900": 0,
  "901-above": 3
}
```


### GET
An API for pie chart with unique categories and number of items from that
category for the selected month regardless of the year.

#### Example Request
```
GET http://localhost:3000/pie-chart/6
```
#### Example Response
```
{
  "jewelery": 3,
  "men's clothing": 1,
  "electronics": 2,
  "women's clothing": 4
}
```


### GET
An API which fetches the data from all the 3 APIs mentioned above, combines
the response and sends a final response of the combined JSON

#### Example Request
```
GET http://localhost:3000/combined-data/6
```
#### Example Response
```
{
  "stat": {
    "total sale": 7699.3,
    "number of sold items": 4,
    "number of not sold items": 6
  },
  "barChart": {
    "0-100": 3,
    "101-200": 1,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 2,
    "601-700": 1,
    "701-800": 0,
    "801-900": 0,
    "901-above": 3
  },
  "pieChart": {
    "jewelery": 3,
    "men's clothing": 1,
    "electronics": 2,
    "women's clothing": 4
  }
}
```