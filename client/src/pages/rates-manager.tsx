import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ratesApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { insertGoldRatesSchema } from "@shared/schema";

export default function RatesManager() {
  const { toast } = useToast();

  // Get current rates
  const { data: currentRates, isLoading } = useQuery({
    queryKey: ["/api/gold-rates"],
    queryFn: ratesApi.getCurrent
  });

  // Form setup
  const form = useForm<z.infer<typeof insertGoldRatesSchema>>({
    resolver: zodResolver(insertGoldRatesSchema),
    defaultValues: {
      gold_24k_sale: currentRates?.gold_24k_sale || 7850,
      gold_24k_purchase: currentRates?.gold_24k_purchase || 7800,
      gold_22k_sale: currentRates?.gold_22k_sale || 7200,
      gold_22k_purchase: currentRates?.gold_22k_purchase || 7150,
      gold_18k_sale: currentRates?.gold_18k_sale || 5900,
      gold_18k_purchase: currentRates?.gold_18k_purchase || 5850,
      silver_per_kg_sale: currentRates?.silver_per_kg_sale || 95000,
      silver_per_kg_purchase: currentRates?.silver_per_kg_purchase || 94000,
      is_active: true
    }
  });

  // Update rates mutation
  const updateRatesMutation = useMutation({
    mutationFn: ratesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gold-rates"] });
      toast({
        title: "Success",
        description: "Rates updated successfully! Changes will appear on TV display."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update rates. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof insertGoldRatesSchema>) => {
    updateRatesMutation.mutate(data);
  };

  // Update form values when current rates change
  React.useEffect(() => {
    if (currentRates) {
      form.reset({
        gold_24k_sale: currentRates.gold_24k_sale,
        gold_24k_purchase: currentRates.gold_24k_purchase,
        gold_22k_sale: currentRates.gold_22k_sale,
        gold_22k_purchase: currentRates.gold_22k_purchase,
        gold_18k_sale: currentRates.gold_18k_sale,
        gold_18k_purchase: currentRates.gold_18k_purchase,
        silver_per_kg_sale: currentRates.silver_per_kg_sale,
        silver_per_kg_purchase: currentRates.silver_per_kg_purchase,
        is_active: true
      });
    }
  }, [currentRates, form]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
        <div className="flex items-center space-x-3 p-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">DEVI JEWELLERS</h1>
            <p className="text-yellow-200 text-sm font-medium">Rate Control Panel</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-l-4 border-yellow-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">System Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Last Updated: {currentRates?.updated_date 
                    ? format(new Date(currentRates.updated_date), "PPpp")
                    : "Never"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Update Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-3 text-yellow-100">🪙</span>
              Update Gold & Silver Rates
            </h2>
            <p className="text-yellow-100 text-sm mt-1">Set current market rates for TV display</p>
          </div>

          {/* Form Body */}
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* 24K Gold */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 mr-3 text-lg">⭐</span>
                    <h3 className="font-semibold text-gray-800 text-lg">24K Gold</h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Per 10 GMS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gold_24k_sale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Sale Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-24k-sale" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gold_24k_purchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Purchase Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-24k-purchase" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 22K Gold */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-600 mr-3 text-lg">🏅</span>
                    <h3 className="font-semibold text-gray-800 text-lg">22K Gold</h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Per 10 GMS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gold_22k_sale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Sale Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-22k-sale" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gold_22k_purchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Purchase Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-22k-purchase" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 18K Gold */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-700 mr-3 text-lg">👑</span>
                    <h3 className="font-semibold text-gray-800 text-lg">18K Gold</h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Per 10 GMS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gold_18k_sale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Sale Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-18k-sale" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gold_18k_purchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Purchase Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-gold-18k-purchase" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Silver */}
                <div className="pb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-gray-400 mr-3 text-lg">⚪</span>
                    <h3 className="font-semibold text-gray-800 text-lg">Silver</h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Per KG</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="silver_per_kg_sale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Sale Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-silver-sale" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="silver_per_kg_purchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Purchase Rate (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">₹</span>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-medium"
                                data-testid="input-silver-purchase" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-lg"
                    disabled={updateRatesMutation.isPending}
                    data-testid="button-update-rates"
                  >
                    {updateRatesMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        📺 Update Rates on TV Display
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Current Rates Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <h2 className="text-lg font-bold flex items-center">
              <span className="mr-3">👁️</span>
              Currently Displayed Rates
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Gold Rates Display */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100" data-testid="display-gold-24k-sale">
                    <span className="font-medium text-gray-600">24K Gold Sale:</span>
                    <span className="font-bold text-yellow-600 text-lg">₹{currentRates?.gold_24k_sale?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100" data-testid="display-gold-22k-sale">
                    <span className="font-medium text-gray-600">22K Gold Sale:</span>
                    <span className="font-bold text-yellow-600 text-lg">₹{currentRates?.gold_22k_sale?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">18K Gold Sale:</span>
                    <span className="font-bold text-yellow-600 text-lg">₹{currentRates?.gold_18k_sale?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">24K Gold Purchase:</span>
                    <span className="font-bold text-green-600 text-lg">₹{currentRates?.gold_24k_purchase?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">22K Gold Purchase:</span>
                    <span className="font-bold text-green-600 text-lg">₹{currentRates?.gold_22k_purchase?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">18K Gold Purchase:</span>
                    <span className="font-bold text-green-600 text-lg">₹{currentRates?.gold_18k_purchase?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Silver Rates Display */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Silver Rates (Per KG)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center" data-testid="display-silver-sale">
                    <span className="font-medium text-gray-600">Sale:</span>
                    <span className="font-bold text-gray-600 text-lg">₹{currentRates?.silver_per_kg_sale?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Purchase:</span>
                    <span className="font-bold text-green-600 text-lg">₹{currentRates?.silver_per_kg_purchase?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span className="text-blue-500">ℹ️</span>
            <div>
              <p className="font-medium">System Information</p>
              <p className="text-xs mt-1">Changes will be reflected on the TV display within 30 seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}