// src/app/product-list/product.model.ts
export class Product {
    id: string | undefined;
    photo: string | undefined; // URL to the product photo
    name: string | undefined;
    price!: number;
    servingSize: string | undefined;
    amountLeftInStock!: number;
    initialStock!: number; // New property to track initial stock
    quantity!: number | 0;
  }
  