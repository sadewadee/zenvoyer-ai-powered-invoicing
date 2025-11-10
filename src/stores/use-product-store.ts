import { create } from 'zustand';
import type { Product } from '@/types';
import { getProducts, addProduct as apiAddProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct } from '@/lib/api-client';
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}
export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  error: null,
  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      const products = await getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  getProductById: (id) => get().products.find(p => p.id === id),
  addProduct: async (product) => {
    const newProduct = await apiAddProduct(product);
    set(state => ({ products: [...state.products, newProduct] }));
  },
  updateProduct: async (updatedProduct) => {
    const returnedProduct = await apiUpdateProduct(updatedProduct);
    set(state => ({
      products: state.products.map(product =>
        product.id === returnedProduct.id ? returnedProduct : product
      ),
    }));
  },
  deleteProduct: async (id) => {
    await apiDeleteProduct(id);
    set(state => ({
      products: state.products.filter(product => product.id !== id),
    }));
  },
}));
// Initial fetch
useProductStore.getState().fetchProducts();