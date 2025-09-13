import { createContext, useContext } from 'react';
import { useProducts as useProductsHook } from '../api/products';

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const productsData = useProductsHook();

  return (
    <ProductsContext.Provider value={productsData}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
