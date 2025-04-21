
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getSellerOrders } from "@/services/orders.service";
import { Order } from "@/services/orders.service";
import { Loader2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Orders() {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", currentUser?.uid, statusFilter],
    queryFn: async () => {
      if (!currentUser) return [];
      return statusFilter === "all" 
        ? getSellerOrders(currentUser.uid)
        : getSellerOrders(currentUser.uid, statusFilter);
    },
    enabled: !!currentUser,
  });

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy - h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as Order["status"] | "all")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Manage and track your customer orders.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500 py-8">
              No {statusFilter !== "all" ? statusFilter : ""} orders found.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {order.products.map((product, index) => (
                        <span key={product.productId}>
                          {product.name} ({product.quantity})
                          {index < order.products.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "active" ? "bg-blue-100 text-blue-800" : 
                        order.status === "completed" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {order.status}
                      </div>
                    </TableCell>
                    <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.status === "active" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Mark as completed functionality will be added later
                            console.log("Mark as completed:", order.id);
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
