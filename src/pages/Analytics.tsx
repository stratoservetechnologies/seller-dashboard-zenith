
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { 
  getDailyTrends, 
  getOrderStats,
} from "@/services/analytics.service";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { subDays, startOfMonth, endOfMonth } from "date-fns";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<string>("7days");
  
  // Calculate date range based on selected range
  const today = new Date();
  const getDateRange = () => {
    switch (timeRange) {
      case "7days":
        return {
          startDate: subDays(today, 7),
          endDate: today
        };
      case "month":
        return {
          startDate: startOfMonth(today),
          endDate: endOfMonth(today)
        };
      default:
        return {
          startDate: subDays(today, 7),
          endDate: today
        };
    }
  };
  
  const { startDate, endDate } = getDateRange();
  
  const { data: dailyStats, isLoading: isDailyStatsLoading } = useQuery({
    queryKey: ["dailyStats", currentUser?.uid, startDate, endDate],
    queryFn: () => currentUser ? getDailyTrends(currentUser.uid, startDate, endDate) : Promise.resolve([]),
    enabled: !!currentUser,
  });
  
  const { data: orderStats, isLoading: isOrderStatsLoading } = useQuery({
    queryKey: ["orderStats", currentUser?.uid, startDate, endDate],
    queryFn: () => currentUser ? getOrderStats(currentUser.uid, startDate, endDate) : Promise.resolve({
      totalOrders: 0,
      totalRevenue: 0,
      completedOrders: 0,
      activeOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0
    }),
    enabled: !!currentUser,
  });
  
  // Format data for pie chart
  const pieData = orderStats ? [
    { name: "Active", value: orderStats.activeOrders },
    { name: "Completed", value: orderStats.completedOrders },
    { name: "Cancelled", value: orderStats.cancelledOrders }
  ].filter(item => item.value > 0) : [];

  const isLoading = isDailyStatsLoading || isOrderStatsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Track your sales performance and customer behavior.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹{orderStats?.totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{orderStats?.totalOrders}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Completed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{orderStats?.completedOrders}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Average Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ₹{orderStats?.averageOrderValue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Chart */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Daily Sales Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {dailyStats && dailyStats.length > 0 ? (
                    <ChartContainer 
                      config={{ 
                        sales: { 
                          label: "Sales",
                          color: "#9333ea" 
                        } 
                      }}
                    >
                      <BarChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                        <ChartLegend />
                        <Bar dataKey="revenue" name="revenue" fill="var(--color-sales)" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full justify-center items-center">
                      <p className="text-muted-foreground">No sales data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Orders by Status Chart */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {pieData && pieData.length > 0 ? (
                    <PieChart width={400} height={300}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <div className="flex h-full justify-center items-center">
                      <p className="text-muted-foreground">No order data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
