import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { settingsApi, systemApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { insertDisplaySettingsSchema } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();

  // Get current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/display"],
    queryFn: settingsApi.getDisplay
  });

  // Get system info
  const { data: systemInfo } = useQuery({
    queryKey: ["/api/system/info"],
    queryFn: systemApi.getInfo,
    refetchInterval: 30000
  });

  // Form setup
  const form = useForm<z.infer<typeof insertDisplaySettingsSchema>>({
    resolver: zodResolver(insertDisplaySettingsSchema),
    defaultValues: {
      orientation: settings?.orientation || "horizontal",
      background_color: settings?.background_color || "#FFF8E1",
      text_color: settings?.text_color || "#212529",
      rate_number_font_size: settings?.rate_number_font_size || "text-4xl",
      show_media: settings?.show_media ?? true,
      rates_display_duration: settings?.rates_display_duration || 15,
      refresh_interval: settings?.refresh_interval || 30
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertDisplaySettingsSchema>) => 
      settingsApi.updateDisplay(settings?.id || 1, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/display"] });
      toast({
        title: "Success",
        description: "Settings updated successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof insertDisplaySettingsSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  // Update form when settings load
  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const colorPresets = [
    { name: "Gold Theme", colors: { background: "#FFF8E1", text: "#212529", accent: "#FFC107" } },
    { name: "Blue Theme", colors: { background: "#E3F2FD", text: "#1565C0", accent: "#2196F3" } },
    { name: "Green Theme", colors: { background: "#E8F5E8", text: "#2E7D32", accent: "#4CAF50" } },
    { name: "Purple Theme", colors: { background: "#F3E5F5", text: "#6A1B9A", accent: "#9C27B0" } }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-jewelry-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-jewelry-primary to-jewelry-secondary rounded-xl flex items-center justify-center">
              <i className="fas fa-gem text-white text-xl"></i>
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">DEVI JEWELLERS</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Admin Dashboard</h2>
          <p className="text-gray-600">Manage display settings, timing, and appearance</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Display Settings */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center">
                    <i className="fas fa-desktop mr-2"></i>Display Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="orientation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TV Orientation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-orientation">
                              <SelectValue placeholder="Select orientation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="horizontal">Horizontal (Landscape)</SelectItem>
                            <SelectItem value="vertical">Vertical (Portrait)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rate_number_font_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Numbers Font Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-font-size">
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text-2xl">Small (2XL)</SelectItem>
                            <SelectItem value="text-3xl">Medium (3XL)</SelectItem>
                            <SelectItem value="text-4xl">Large (4XL)</SelectItem>
                            <SelectItem value="text-5xl">Extra Large (5XL)</SelectItem>
                            <SelectItem value="text-6xl">Huge (6XL)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="show_media"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <FormLabel className="font-medium text-gray-800">Show Media Rotation</FormLabel>
                          <p className="text-sm text-gray-600">Alternate between rates and promotional content</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-show-media"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Color Customization */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center">
                    <i className="fas fa-palette mr-2"></i>Color Customization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="background_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            data-testid="color-background"
                          />
                          <FormControl>
                            <Input 
                              {...field} 
                              className="flex-1"
                              data-testid="input-background-color"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="text_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            data-testid="color-text"
                          />
                          <FormControl>
                            <Input 
                              {...field} 
                              className="flex-1"
                              data-testid="input-text-color"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Color Presets */}
                  <div>
                    <FormLabel>Quick Presets</FormLabel>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorPresets.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full h-8 rounded hover:scale-105 transition-transform"
                          style={{ 
                            background: `linear-gradient(to right, ${preset.colors.background}, ${preset.colors.accent})`
                          }}
                          title={preset.name}
                          onClick={() => {
                            form.setValue("background_color", preset.colors.background);
                            form.setValue("text_color", preset.colors.text);
                          }}
                          data-testid={`preset-${preset.name.toLowerCase().replace(' ', '-')}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Settings */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center">
                    <i className="fas fa-clock mr-2"></i>Timing Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="refresh_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refresh Interval (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="10" 
                            max="300" 
                            {...field}
                            data-testid="input-refresh-interval"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-600">How often to check for rate updates</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rates_display_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rates Display Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="60" 
                            {...field}
                            data-testid="input-rates-duration"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-600">How long to show rates before switching to media</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {systemInfo && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Current Status</h4>
                      <p className="text-sm text-green-700">Status: {systemInfo.status}</p>
                      <p className="text-sm text-green-700">Last sync: {systemInfo.last_sync}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center">
                    <i className="fas fa-info-circle mr-2"></i>System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {systemInfo && (
                    <>
                      <div className="flex justify-between" data-testid="system-status">
                        <span className="text-gray-600">Server Status:</span>
                        <span className="text-green-600 font-semibold flex items-center">
                          <i className="fas fa-circle text-xs mr-1"></i>{systemInfo.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between" data-testid="system-ip">
                        <span className="text-gray-600">Local IP:</span>
                        <span className="font-mono text-sm">{systemInfo.local_ip}</span>
                      </div>
                      
                      <div className="flex justify-between" data-testid="system-devices">
                        <span className="text-gray-600">Connected Devices:</span>
                        <span className="font-semibold">{systemInfo.connected_devices}</span>
                      </div>
                      
                      <div className="flex justify-between" data-testid="system-storage">
                        <span className="text-gray-600">Storage Used:</span>
                        <span className="font-semibold">{systemInfo.storage_used} / {systemInfo.storage_total}</span>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-blue-700 border-blue-200 hover:bg-blue-50"
                        data-testid="button-sync"
                      >
                        <i className="fas fa-sync-alt mr-1"></i>Sync Now
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-red-700 border-red-200 hover:bg-red-50"
                        data-testid="button-restart"
                      >
                        <i className="fas fa-power-off mr-1"></i>Restart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Settings Button */}
            <div className="text-center">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-jewelry-primary to-jewelry-secondary text-white px-8 py-4 text-lg"
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save All Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
