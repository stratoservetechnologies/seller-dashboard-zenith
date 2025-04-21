
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Package, 
  PackageCheck,
  DollarSign,
  Loader2
} from "lucide-react";
import { collection, query, where, getDocs, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    
    // Reference to products collection
    const productsRef = collection(db, `sellers/${currentUser.uid}/products`);
    const ordersRef = collection(db, `sellers/${currentUser.uid}/orders`);

    // Get total products count
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
    });

    // Get active orders count
    const activeOrdersQuery = query(ordersRef, where("status", "==", "Active"));
    const unsubscribeActiveOrders = onSnapshot(activeOrdersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeOrders: snapshot.size }));
    });

    // Get completed orders count
    const completedOrdersQuery = query(ordersRef, where("status", "==", "Completed"));
    const unsubscribeCompletedOrders = onSnapshot(completedOrdersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, completedOrders: snapshot.size }));

      // Calculate total revenue from completed orders
      let revenue = 0;
      snapshot.forEach(doc => {
        const orderData = doc.data();
        revenue += orderData.amountPaid || 0;
      });
      setStats(prev => ({ ...prev, totalRevenue: revenue }));
      
      setIsLoading(false);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeProducts();
      unsubscribeActiveOrders();
      unsubscribeCompletedOrders();
    };
  }, [currentUser]);

  const StatCard = ({ title, value, icon, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your seller dashboard. Here's an overview of your business.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts} 
              icon={<ShoppingBag className="h-4 w-4 text-white" />} 
              color="bg-blue-500"
            />
            <StatCard 
              title="Active Orders" 
              value={stats.activeOrders}
              icon={<Package className="h-4 w-4 text-white" />}
              color="bg-yellow-500"
            />
            <StatCard 
              title="Completed Orders" 
              value={stats.completedOrders}
              icon={<PackageCheck className="h-4 w-4 text-white" />}
              color="bg-green-500"
            />
            <StatCard 
              title="Total Revenue" 
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-white" />}
              color="bg-purple-500"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
