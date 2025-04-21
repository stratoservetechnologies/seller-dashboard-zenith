
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Products() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <Button>
            Add New Product
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Manage your dresses and products available for sale.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-gray-500 py-8">
              You haven't added any products yet.
            </p>
            <div className="flex justify-center">
              <Button>
                Add Your First Product
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
