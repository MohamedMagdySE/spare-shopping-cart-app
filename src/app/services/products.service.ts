
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    /** products.json path */
    private productsUrl = 'products.json';
    /** cart total amount */
    public totalAmount: number = 0;
    /** products behavior subject to pass products through the app */
    products$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);
    /** loading spinner flag */
    public loading: boolean = false;

    // Array to store cart items
    public cart: Product[] = [];

    constructor(private http: HttpClient) { }

    /**
     * loads products with delay 500 ms
     */
    loadProducts(): Observable<Product[]> {
        this.products$.subscribe(p => {
            if (p.length !== 0) {
                return this.products$.asObservable();
            }
            else {
                setTimeout(() => {
                    this.loading = true;
                    this.http.get<Product[]>(this.productsUrl)
                        .subscribe(products => {
                            this.products$.next(products);
                            this.loading = false;
                        });
                }, 500);
                return this.products$.asObservable();
            }
        })
        return this.products$.asObservable();


    }

    getProducts(): Observable<Product[]> {
        return this.products$.asObservable();
    }

    /**
     * 
     * @param product 
     * @returns the update cart array after adding a product to the cart
     */
    addToCart(product: Product): Product[] {
        const foundItem = this.cart.find(item => item.id === product.id);
        if (foundItem && foundItem.amountLeftInStock > 0) {
            foundItem.amountLeftInStock--;
            foundItem.quantity++;
            this.totalAmount += foundItem.price;
        }
        else {
            product.amountLeftInStock--;
            this.totalAmount += product.price;
            product.quantity++;
            this.cart.push(product)
        }
        return this.cart
    }

    /**
     * 
     * @param product 
     * @returns  cart array after removing the specific product
     */
    removeFromCart(product: Product): Product[] {
        const foundItemIndex = this.cart.findIndex(item => item.id === product.id);
        if (foundItemIndex !== -1) {
            if (this.cart[foundItemIndex].quantity > 0) {
                this.cart[foundItemIndex].quantity--;
                this.cart[foundItemIndex].amountLeftInStock++;
                this.totalAmount -= this.cart[foundItemIndex].price;
                if (this.cart[foundItemIndex].quantity === 0) {
                    this.cart.splice(foundItemIndex, 1);
                }
            }
        }
        return this.cart;
    }

    /**
     * 
     * @returns cart array
     */
    getCart(): Product[] {
        return this.cart;
    }
    /**
     * 
     * @returns total amount
     */
    getTotalAmount(): number {
        return this.totalAmount;
    }
    /**
     * adds the new product to the current products
     * @param newProduct 
     */
    addProduct(newProduct: Product): any {
        const currentProducts = this.products$.getValue();
        currentProducts.push(newProduct);
        this.products$.next(currentProducts);
    }

    editProduct(updatedProduct: Product): any {
        const currentProducts = this.products$.getValue();
        const index = currentProducts.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            // Update the product in the array
            currentProducts[index] = updatedProduct;
            this.products$.next(currentProducts);
            this.updateCartTotal(updatedProduct);
        }
    }

    private updateCartTotal(updatedProduct: Product): void {
        const foundInCart = this.cart.find(item => item.id === updatedProduct.id);
        if (foundInCart) {
            const priceDifference = updatedProduct.price - foundInCart.price;
            this.totalAmount += priceDifference * foundInCart.quantity;
            foundInCart.price = updatedProduct.price;
        }
    }

    resetQuantities() {
        this.products$.subscribe(prods => {
            prods.forEach(prod => {
                prod.quantity = 0;
                prod.amountLeftInStock = prod.initialStock;
            });
        })
    }
}
