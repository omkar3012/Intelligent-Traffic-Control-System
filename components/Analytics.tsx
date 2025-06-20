'use client'

import { TrafficData } from '@/types/traffic'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Clock, TrendingUp, Users, Zap } from 'lucide-react'

interface AnalyticsProps {
  data: TrafficData
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="card">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function Analytics({ data }: AnalyticsProps) {
  const { intersectionData, analytics, processingTime } = data
  const { lanes, totalVehicles, efficiency, cycleTime } = intersectionData
  const { 
    averageSpeed = 0, 
    congestionLevel = 'low', 
    recommendations = [], 
    laneEfficiency = {}, 
    vehicleTypes = {} 
  } = analytics || {};

  const vehicleTypeData = Object.entries(vehicleTypes).map(([name, value]) => ({ name, count: value }))

  const laneEfficiencyData = Object.entries(laneEfficiency).map(([id, value]) => {
    const lane = lanes.find(l => l.id === id)
    return {
      name: lane?.name || 'Unknown Lane',
      efficiency: value * 100,
    }
  })

  if (!data) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Analytics</h2>
        <p className="text-gray-600">Upload and process a file to view analytics.</p>
      </div>
    )
  }

  // Prepare data for charts
  const allDetections = lanes.flatMap(lane => lane.vehicleDetections || []);

  const vehicleTypeCounts = allDetections.reduce((acc, detection) => {
    acc[detection.label] = (acc[detection.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(vehicleTypeCounts).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }))

  const pieChartData = Object.entries(vehicleTypeCounts).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const signalEfficiencyData = intersectionData.signalTimings.map((timing, index) => ({
    direction: timing.direction,
    green: timing.green,
    yellow: timing.yellow,
    red: timing.red,
    efficiency: Math.round((timing.green / (timing.green + timing.yellow + timing.red)) * 100)
  }))

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Intersection Performance</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{(processingTime || 0).toFixed(2)}s</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{totalVehicles || 0} vehicles</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{((efficiency || 0) * 100).toFixed(1)}% efficiency</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Average Speed" 
          value={`${(averageSpeed || 0).toFixed(1)} km/h`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard 
          title="Congestion Level" 
          value={congestionLevel || 'N/A'}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard 
          title="Cycle Time" 
          value={`${(cycleTime || 0).toFixed(0)} s`}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Traffic Analytics Dashboard</h2>
          
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Total Vehicles</h3>
              <p className="text-2xl font-bold text-blue-900">{totalVehicles || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Processing Time</h3>
              <p className="text-2xl font-bold text-green-900">{(processingTime || 0).toFixed(2)}s</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800">Vehicle Types</h3>
              <p className="text-2xl font-bold text-purple-900">{Object.keys(vehicleTypeCounts).length}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-sm font-medium text-orange-800">Signals Optimized</h3>
              <p className="text-2xl font-bold text-orange-900">{intersectionData.signalTimings.length}</p>
            </div>
          </div>

          {/* Vehicle Distribution Chart */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Composition</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Signal Efficiency Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signal Timing Efficiency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signalEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="direction" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#10B981" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Most common vehicle type: {Object.entries(vehicleTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]}</li>
                <li>• Average processing time: {(processingTime || 0).toFixed(2)} seconds</li>
                <li>• Total vehicle density: {(totalVehicles || 0)} vehicles detected</li>
                <li>• Signal optimization applied to {(intersectionData.signalTimings.length || 0)} directions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Consider extending green time for high-traffic directions</li>
                <li>• Monitor vehicle type patterns for infrastructure planning</li>
                <li>• Implement dynamic signal timing based on real-time data</li>
                <li>• Regular calibration of detection algorithms for accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 