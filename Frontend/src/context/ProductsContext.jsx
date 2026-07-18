import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config';

const ProductsContext = createContext();

export function useProducts() {
  return useContext(ProductsContext);
}

export default function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/products`);
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductsContext.Provider value={{ products, loading, refreshProducts: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}
