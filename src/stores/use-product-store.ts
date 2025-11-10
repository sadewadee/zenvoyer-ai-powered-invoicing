import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Product } from '@/types';
interface ProductState {
  products: Product[];
  getProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}
const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Web Development', description: 'Full-stack web development services.', unitPrice: 2500, category: 'Services' },
  { id: 'prod-2', name: 'UI/UX Design', description: 'User interface and experience design.', unitPrice: 1500, category: 'Services' },
  { id: 'prod-3', name: 'SaaS Subscription', description: 'Monthly subscription for our software.', unitPrice: 49.99, category: 'Software' },
  { id: 'prod-4', name: 'Consulting Hour', description: 'One hour of technical consulting.', unitPrice: 150, category: 'Services' },
];
export const useProductStore = create<ProductState>((set, get) => ({
  products: initialProducts,
  getProducts: () => get().products,
  getProductById: (id) => get().products.find(p => p.id === id),
  addProduct: (product) => {
    const newProduct = { ...product, id: uuidv4() };
    set(state => ({ products: [...state.products, newProduct] }));
  },
  updateProduct: (updatedProduct) => {
    set(state => ({
      products: state.products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    }));
  },
  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(product => product.id !== id),
    }));
  },
}));