
import { getSellerProducts } from './products.service';
import { getOrdersByDateRange } from './orders.service';
import { subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
  completedOrders: number;
}

// Get dashboard summary
export const getDashboardSummary = async (sellerId: string) => {
  const endDate = new Date();
  const startDate = subDays(endDate, 30); // Last 30 days by default
  
  const [products, orders] = await Promise.all([
    getSellerProducts(sellerId),
    getOrdersByDateRange(sellerId, startDate, endDate)
  ]);
  
  return {
    totalProducts: products.length,
    totalInventory: products.reduce((sum, product) => sum + product.quantity, 0),
    activeOrders: orders.filter(order => order.status === 'active').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };
};

// Get daily trends
export const getDailyTrends = async (
  sellerId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyStats[]> => {
  const orders = await getOrdersByDateRange(sellerId, startDate, endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(date => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    
    return {
      date: date.toISOString().split('T')[0],
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      completedOrders: dayOrders.filter(order => order.status === 'completed').length
    };
  });
};

// Get weekly trends
export const getWeeklyTrends = async (
  sellerId: string,
  startDate: Date,
  endDate: Date
) => {
  const dailyStats = await getDailyTrends(sellerId, startDate, endDate);
  
  // Group by week
  const weeklyStats = dailyStats.reduce((weeks: any[], day) => {
    const weekIndex = Math.floor(
      (new Date(day.date).getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = {
        startDate: day.date,
        orders: 0,
        revenue: 0,
        completedOrders: 0
      };
    }
    
    weeks[weekIndex].orders += day.orders;
    weeks[weekIndex].revenue += day.revenue;
    weeks[weekIndex].completedOrders += day.completedOrders;
    
    return weeks;
  }, []);
  
  return weeklyStats;
};

// Get monthly trends
export const getMonthlyTrends = async (
  sellerId: string,
  startDate: Date,
  endDate: Date
) => {
  const dailyStats = await getDailyTrends(sellerId, startDate, endDate);
  
  // Group by month
  const monthlyStats = dailyStats.reduce((months: any[], day) => {
    const monthKey = day.date.substring(0, 7); // YYYY-MM
    const monthIndex = months.findIndex(m => m.month === monthKey);
    
    if (monthIndex === -1) {
      months.push({
        month: monthKey,
        orders: day.orders,
        revenue: day.revenue,
        completedOrders: day.completedOrders
      });
    } else {
      months[monthIndex].orders += day.orders;
      months[monthIndex].revenue += day.revenue;
      months[monthIndex].completedOrders += day.completedOrders;
    }
    
    return months;
  }, []);
  
  return monthlyStats;
};

// Get order stats
export const getOrderStats = async (
  sellerId: string,
  startDate: Date,
  endDate: Date
) => {
  const orders = await getOrdersByDateRange(sellerId, startDate, endDate);
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const activeOrders = orders.filter(order => order.status === 'active').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalOrders,
    totalRevenue,
    completedOrders,
    activeOrders,
    cancelledOrders,
    averageOrderValue
  };
};
