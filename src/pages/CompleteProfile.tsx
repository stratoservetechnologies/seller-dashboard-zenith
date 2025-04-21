
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function CompleteProfile() {
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentUser, updateUserProfile, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-fill the email from the current user
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || "");
    }
    
    // Pre-fill form if user profile exists
    if (userProfile) {
      setStoreName(userProfile.storeName || "");
      setLocation(userProfile.location || "");
      setPhone(userProfile.phone || "");
      setPreviewUrl(userProfile.photoURL || null);
    }
  }, [currentUser, userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileUpload(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!fileUpload || !currentUser) return null;
    
    setUploadingImage(true);
    try {
      const fileRef = ref(storage, `profile-images/${currentUser.uid}/${fileUpload.name}`);
      await uploadBytes(fileRef, fileUpload);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      return setError("You must be logged in to complete your profile");
    }
    
    if (!storeName || !location || !phone) {
      return setError("Please fill out all required fields");
    }
    
    try {
      setError("");
      setIsLoading(true);
      
      // Upload the image if one was provided
      let photoURL = userProfile?.photoURL || null;
      if (fileUpload) {
        photoURL = await uploadImage();
      }
      
      // Update the user profile
      await updateUserProfile({
        storeName,
        location,
        phone,
        email,
        photoURL: photoURL || null
      });
      
      toast({
        title: "Profile complete",
        description: "Your seller profile has been updated successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              Tell us more about your Facebook Live store
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-12 w-12 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                        />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="upload-photo" className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {previewUrl ? "Change photo" : "Upload photo"}
                  </label>
                  <input
                    id="upload-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                
                {/* Store Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="store-name">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="store-name"
                    type="text"
                    placeholder="Your Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>
                
                {/* Store Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="location">
                    Store Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                
                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!currentUser?.email}
                    required
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  type="submit" 
                  disabled={isLoading || uploadingImage}
                >
                  {isLoading ? "Saving..." : "Complete Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
