import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { mediaApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { MediaItem } from "@shared/schema";

export default function MediaManager() {
  const { toast } = useToast();
  const [uploadSettings, setUploadSettings] = useState({
    duration: 30,
    mediaType: "auto",
    autoActivate: true
  });

  // Get media items
  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ["/api/media"],
    queryFn: () => mediaApi.getAll()
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ files, settings }: { files: FileList; settings: typeof uploadSettings }) =>
      mediaApi.upload(files, { duration: settings.duration, autoActivate: settings.autoActivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media files uploaded successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload media files. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MediaItem> }) =>
      mediaApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media item updated successfully!"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media item deleted successfully!"
      });
    }
  });

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const fileList = files.reduce((acc, file) => {
        const dt = new DataTransfer();
        Array.from(acc).forEach(f => dt.items.add(f));
        dt.items.add(file);
        return dt.files;
      }, new DataTransfer().files);
      
      uploadMutation.mutate({ files: fileList, settings: uploadSettings });
    }
  };

  const handleUpdateItem = (id: number, field: string, value: any) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading media...</p>
        </div>
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
  <div className="flex justify-center mb-4">
    <img 
      src="/logo.png" 
      alt="Devi Jewellers Logo" 
      className="h-40 w-[350px] object-contain"
    />
  </div>

          <h2 className="text-xl font-semibold text-gray-700">Media Manager</h2>
          <p className="text-gray-600">Upload and manage promotional videos and images for TV ads</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardTitle className="flex items-center">
              <i className="fas fa-cloud-upload-alt mr-2"></i>Upload New Media
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                onDrop={handleFileUpload}
                accept="image/*,video/*"
                multiple={true}
                data-testid="media-upload-dropzone"
              >
                <div>
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <p className="text-lg font-semibold text-gray-700">Drop files here or click to upload</p>
                  <p className="text-gray-500 mb-4">Support for images (JPG, PNG) and videos (MP4, AVI)</p>
                </div>
              </FileUpload>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration (seconds)</label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={uploadSettings.duration}
                    onChange={(e) => setUploadSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    data-testid="input-default-duration"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                  <Select 
                    value={uploadSettings.mediaType} 
                    onValueChange={(value) => setUploadSettings(prev => ({ ...prev, mediaType: value }))}
                  >
                    <SelectTrigger data-testid="select-media-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="auto">Auto Detect</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto Activate</label>
                  <Select 
                    value={uploadSettings.autoActivate.toString()} 
                    onValueChange={(value) => setUploadSettings(prev => ({ ...prev, autoActivate: value === "true" }))}
                  >
                    <SelectTrigger data-testid="select-auto-activate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="true">Yes, activate immediately</SelectItem>
                      <SelectItem value="false">No, keep inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mediaItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${item.is_active ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
              <div className="relative aspect-video bg-gray-100">
                {item.media_type === 'image' ? (
                  <img 
                    src={item.file_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    data-testid={`media-image-${item.id}`}
                  />
                ) : (
                  <>
                    <video 
                      src={item.file_url} 
                      className="w-full h-full object-cover"
                      data-testid={`media-video-${item.id}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                        <i className="fas fa-play text-green-600 text-xl ml-1"></i>
                      </button>
                    </div>
                  </>
                )}
                
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  <i className={`fas fa-${item.media_type === 'image' ? 'image' : 'video'} mr-1`}></i>
                  {item.media_type.toUpperCase()}
                </div>
                
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button 
                    className={`w-8 h-8 text-white rounded-full flex items-center justify-center hover:opacity-80 ${item.is_active ? 'bg-green-500' : 'bg-gray-500'}`}
                    onClick={() => handleUpdateItem(item.id, 'is_active', !item.is_active)}
                    data-testid={`button-toggle-${item.id}`}
                  >
                    <i className={`fas fa-${item.is_active ? 'eye' : 'eye-slash'} text-xs`}></i>
                  </button>
                  <button 
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    onClick={() => deleteMutation.mutate(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {item.duration_seconds}s
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2" data-testid={`media-name-${item.id}`}>
                  {item.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-gray-600">Duration (sec)</label>
                    <Input 
                      type="number" 
                      value={item.duration_seconds} 
                      onChange={(e) => handleUpdateItem(item.id, 'duration_seconds', parseInt(e.target.value))}
                      className="text-sm"
                      data-testid={`input-duration-${item.id}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Order</label>
                    <Input 
                      type="number" 
                      value={item.order_index} 
                      onChange={(e) => handleUpdateItem(item.id, 'order_index', parseInt(e.target.value))}
                      className="text-sm"
                      data-testid={`input-order-${item.id}`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${item.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="text-xs text-gray-500">
                    {item.file_size ? formatFileSize(item.file_size) : 'Unknown size'} • {item.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">Bulk Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="text-green-700 border-green-200 hover:bg-green-50"
                data-testid="button-activate-selected"
              >
                <i className="fas fa-eye mr-2"></i>Activate Selected
              </Button>
              <Button 
                variant="outline" 
                className="text-gray-700 border-gray-200 hover:bg-gray-50"
                data-testid="button-deactivate-selected"
              >
                <i className="fas fa-eye-slash mr-2"></i>Deactivate Selected
              </Button>
              <Button 
                variant="outline" 
                className="text-red-700 border-red-200 hover:bg-red-50"
                data-testid="button-delete-selected"
              >
                <i className="fas fa-trash mr-2"></i>Delete Selected
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-700 border-blue-200 hover:bg-blue-50"
                data-testid="button-download-selected"
              >
                <i className="fas fa-download mr-2"></i>Download Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
