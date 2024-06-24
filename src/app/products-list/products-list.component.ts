import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model'; 
import { ProductService } from '../services/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  selectedFile!: File;
  products: Product[] = [];
  products$: Observable<Product[]> |undefined;
  totalAmount: number = 0;
  showOverlay: boolean = false;
  newProduct: Product = {
    id: '', name: '', price: 0, photo: '', servingSize: '', amountLeftInStock: 0,
    initialStock: 0,
    quantity: 0
  };
  form: FormGroup;
  editForm: FormGroup;
  photoPath: string = '';


  cart: Product[] = []; 
  loading: boolean = false;
  editingProduct: Product | null = new Product;
  editMode: boolean = false;
  constructor(private productService: ProductService, private fb: FormBuilder) { 
    /** Add Product Form */
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]], 
      price: [null, [Validators.required, Validators.pattern(/^\d*$/)]], 
      servingSize: ['', [Validators.required]], 
      photo: [''],
      amountLeftInStock: ['', [Validators.required, Validators.pattern(/^\d+$/)]], 
    });    

    /** Edit Product Form */
    this.editForm =  this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]], 
      price: [null, [Validators.required, Validators.pattern(/^\d*$/)]], 
      servingSize: ['', [Validators.required]],
      photo: [''],
      amountLeftInStock: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });  
  }

  ngOnInit(): void {
    this.loading = this.productService.loading;
    this.products$ = this.productService.loadProducts();
    setTimeout(() => {
      this.products$?.subscribe(() => {
        this.loading = false;
      });
    },500);
    //this.products$ = this.productService.getProducts();
    this.cart = this.productService.cart; // Retrieve cart from sessionStorage
    this.totalAmount = this.productService.totalAmount;

  }
  addToCart(product: Product): void {
    if(product.amountLeftInStock > 0){
      this.cart = this.productService.addToCart(product);
      this.totalAmount += product.price;
      this.productService.totalAmount = this.totalAmount;
      this.saveCartToSessionStorage(); // Save updated cart to sessionStorage

  }

    console.log('Added to cart:', product);
    console.log(this.cart);

  }
  removeFromCart(product: Product): void {
        this.cart = this.productService.removeFromCart(product);
        this.totalAmount -= product.price;
        this.productService.totalAmount = this.totalAmount;
        this.saveCartToSessionStorage(); 
      console.log(this.cart);
  }
  saveCartToSessionStorage(): void {
    //sessionStorage.setItem('cart', JSON.stringify(this.cart));
  }

  /**
   *  opens add or edit product overlay
   */
  openOverlay(product?: Product): void {
    if (product) {
      this.editingProduct = product;
      this.editMode = true;
      this.editForm.patchValue({
        name: product.name,
        price: product.price,
        servingSize: product.servingSize,
        amountLeftInStock: product.amountLeftInStock
      });
    } else {
      this.editingProduct = null;
      this.editMode = false;
      this.form.reset();
    }
    this.showOverlay = true;
  }

  closeOverlay(){
    this.showOverlay = false;

  }
  get f() {
    return this.form.controls;
  }

  addNewProduct(): void {
    if (this.form.valid) {

      const newProduct = { 
        id: Math.random()*10 + '',
        name: this.f['name'].value,
        price: this.f['price'].value,
        photo: this.photoPath, 
        servingSize: this.f['servingSize'].value, 
        amountLeftInStock: this.f['amountLeftInStock'].value, 
        initialStock: this.f['amountLeftInStock'].value, 
        quantity: 0
        };
      console.log(this.f['name'].value);
      this.products$?.subscribe(pr => {
        pr.push(newProduct);
        
      });
      this.form.reset(); 
      this.productService.getProducts();
     
      this.products.push(newProduct);
      console.log(this.products$)
      
      this.closeOverlay();
    }
    else {
      alert("Product Form is invalid");
    }
  }
  onFileChanged(event : any) {
    this.selectedFile = event.target.files[0]
  }
  addPhoto() {
    this.photoPath = '/imgs/kiwi-lrg.png';
  }

  editProduct(): void {
    if (this.editForm.valid && this.editingProduct) {
      const updatedProduct: Product = {
        ...this.editingProduct,
        name: this.editForm.value.name,
        price: this.editForm.value.price,
        servingSize: this.editForm.value.servingSize,
        amountLeftInStock: this.editForm.value.amountLeftInStock
      };

      this.productService.editProduct(updatedProduct);
        this.productService.getProducts(); 
        this.totalAmount = this.productService.totalAmount;
        this.closeOverlay(); 
    
    } else {
      console.error('Form is invalid. Cannot edit product.');
    }
  }


}
  