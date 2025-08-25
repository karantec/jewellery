import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaManager from "./media-manager";
import PromoManager from "./promo-manager";
import RatesManager from "./rates-manager";
import AdminDashboard from "./admin-dashboard";

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("media");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-2xl">💎</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-wide">DEVI JEWELLERS</h1>
              <p className="text-yellow-200 text-lg font-medium">Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-white shadow-lg rounded-xl p-2">
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-3 px-6 font-semibold transition-all duration-200"
                data-testid="tab-media"
              >
                <span className="mr-2">📹</span>
                Media Manager
              </TabsTrigger>
              <TabsTrigger 
                value="promo" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg py-3 px-6 font-semibold transition-all duration-200"
                data-testid="tab-promo"
              >
                <span className="mr-2">🎨</span>
                Promos
              </TabsTrigger>
              <TabsTrigger 
                value="rates" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-3 px-6 font-semibold transition-all duration-200"
                data-testid="tab-rates"
              >
                <span className="mr-2">💰</span>
                Update Rates
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg py-3 px-6 font-semibold transition-all duration-200"
                data-testid="tab-settings"
              >
                <span className="mr-2">⚙️</span>
                Display Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="media" className="space-y-6">
            <MediaManager />
          </TabsContent>

          <TabsContent value="promo" className="space-y-6">
            <PromoManager />
          </TabsContent>

          <TabsContent value="rates" className="space-y-6">
            <RatesManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Online</span>
              <span>•</span>
              <span>Auto-sync enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="/tv-display" 
                target="_blank"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                data-testid="link-tv-display"
              >
                📺 Open TV Display
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}