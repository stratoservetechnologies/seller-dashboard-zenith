import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Order {
  id: string;
  sellerId: string;
  customerName: string;
  customerEmail: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Get all orders for a seller with optional status filter
export const getSellerOrders = async (
  sellerId: string,
  status?: Order['status']
): Promise<Order[]> => {
  const ordersRef = collection(db, 'sellers', sellerId, 'orders');
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  
  const q = query(ordersRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Get orders for a specific date range
export const getOrdersByDateRange = async (
  sellerId: string,
  startDate: Date,
  endDate: Date,
  status?: Order['status']
): Promise<Order[]> => {
  const ordersRef = collection(db, 'sellers', sellerId, 'orders');
  const constraints: QueryConstraint[] = [
    where('createdAt', '>=', startDate.toISOString()),
    where('createdAt', '<=', endDate.toISOString()),
    orderBy('createdAt', 'desc')
  ];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  
  const q = query(ordersRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Calculate order statistics
export const getOrderStats = async (
  sellerId: string,
  startDate: Date,
  endDate: Date
) => {
  const orders = await getOrdersByDateRange(sellerId, startDate, endDate);
  
  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    completedOrders: orders.filter(order => order.status === 'completed').length,
    activeOrders: orders.filter(order => order.status === 'active').length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
    averageOrderValue: orders.length > 0
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length
      : 0
  };
}; 