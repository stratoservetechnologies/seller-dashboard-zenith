import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

// Add a new product
export const addProduct = async (
  sellerId: string,
  productData: Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const productsRef = collection(db, 'sellers', sellerId, 'products');
  const now = new Date().toISOString();
  
  const docRef = await addDoc(productsRef, {
    ...productData,
    sellerId,
    createdAt: now,
    updatedAt: now
  });
  
  return docRef.id;
};

// Get all products for a seller
export const getSellerProducts = async (sellerId: string): Promise<Product[]> => {
  const productsRef = collection(db, 'sellers', sellerId, 'products');
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

// Update a product
export const updateProduct = async (
  sellerId: string,
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const productRef = doc(db, 'sellers', sellerId, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

// Delete a product
export const deleteProduct = async (
  sellerId: string,
  productId: string
): Promise<void> => {
  const productRef = doc(db, 'sellers', sellerId, 'products', productId);
  await deleteDoc(productRef);
}; 