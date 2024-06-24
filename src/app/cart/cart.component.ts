import { Component, OnInit } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from '../services/products.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];
  totalAmount: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.cartItems = this.productService.getCart();
    this.totalAmount = this.productService.getTotalAmount();
  }

  removeFromCart(item: Product): void {
    if(item.quantity > 0) {
      item.quantity -- ;
      item.amountLeftInStock ++;
    }
    this.productService.removeFromCart(item);
    this.cartItems = this.productService.getCart(); 
  }

  incrementQuantity(item: Product): void {
    if(item.amountLeftInStock > 0) {
      this.productService.addToCart(item);
    }
   
    this.cartItems = this.productService.getCart(); 
    this.totalAmount = this.productService.getTotalAmount();

  }

  decrementQuantity(item: Product): void {
    this.productService.removeFromCart(item);
    this.cartItems = this.productService.getCart(); 
    this.totalAmount = this.productService.getTotalAmount();

  }

  clearCart() : void {
    this.cartItems.forEach(item => {
      item.amountLeftInStock = item.initialStock;
      item.quantity = 0;
    });
    this.productService.totalAmount = 0;
    this.cartItems= [];
    this.productService.cart = [];
    this.totalAmount = this.productService.getTotalAmount();
    this.productService.getProducts();
    this.productService.resetQuantities();
    this.productService.getCart();
  }
}