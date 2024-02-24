import { Products } from "@prisma/client";

export const getSalesData = (products: Products[]) => {
  let result = {
    "total sale": 0,
    "number of sold items": 0,
    "number of not sold items": 0,
  };
  for (const p of products) {
    if (p.sold) {
      result["number of sold items"]++;
      result["total sale"] += parseFloat(p.price);
    } else {
      result["number of not sold items"]++;
    }
  }
  return result;
};

export const getBarChartData = (products: Products[]) => {
  let result = {
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
  };

  for (const p of products) {
    let price = parseFloat(p.price);
    if (price >= 0 && price <= 100) {
      result["0-100"]++;
    } else if (price >= 101 && price <= 200) {
      result["101-200"]++;
    } else if (price >= 201 && price <= 300) {
      result["201-300"]++;
    } else if (price >= 301 && price <= 400) {
      result["301-400"]++;
    } else if (price >= 401 && price <= 500) {
      result["401-500"]++;
    } else if (price >= 501 && price <= 600) {
      result["501-600"]++;
    } else if (price >= 601 && price <= 700) {
      result["601-700"]++;
    } else if (price >= 701 && price <= 800) {
      result["701-800"]++;
    } else if (price >= 801 && price <= 900) {
      result["801-900"]++;
    } else {
      result["901-above"]++;
    }
  }
  return result;
};

export const getPieChartData = (products: Products[]) => {
  let result: { [key: string]: number } = {};
  for (const p of products) {
    if (Object.keys(result).includes(p.category)) {
      result[p.category]++;
    } else {
      result[p.category] = 1;
    }
  }
  return result;
};