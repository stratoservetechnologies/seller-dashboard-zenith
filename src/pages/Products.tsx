
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { AddProductForm } from "@/components/products/AddProductForm";
import { ProductList } from "@/components/products/ProductList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getSellerProducts } from "@/services/products.service";
import { useAuth } from "@/contexts/AuthContext";

export default function Products() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", currentUser?.uid],
    queryFn: () => currentUser ? getSellerProducts(currentUser.uid) : Promise.resolve([]),
    enabled: !!currentUser,
  });

  const handleFormSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <AddProductForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-muted-foreground">
          Manage your dresses and products available for sale.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <ProductList products={products} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-center text-gray-500 py-8">
              You haven't added any products yet.
            </p>
            <div className="flex justify-center">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <AddProductForm onSuccess={handleFormSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
