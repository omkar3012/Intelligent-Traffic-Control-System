'use client'

import { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Play, Pause, RotateCcw, Download, Car, Bus, Truck, Bike, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, TrendingUp, Clock, Zap } from 'lucide-react'
import { TrafficData } from '@/types/traffic'
import { motion, AnimatePresence } from 'framer-motion'

interface TrafficDisplayProps {
  data: TrafficData
}

const DIRECTION_CONFIG = {
  north: { rotation: 0, position: 'top-0 left-1/2 -translate-x-1/2' },
  south: { rotation: 180, position: 'bottom-0 left-1/2 -translate-x-1/2' },
  east: { rotation: 90, position: 'top-1/2 right-0 -translate-y-1/2' },
  west: { rotation: -90, position: 'top-1/2 left-0 -translate-y-1/2' },
}

const ICONS = {
  north: ArrowUp,
  south: ArrowDown,
  east: ArrowRight,
  west: ArrowLeft,
}

const INTENSITY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100'
}

export default function TrafficDisplay({ data }: TrafficDisplayProps) {
  const { lanes, signalTimings } = data.intersectionData
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedLane, setSelectedLane] = useState<string | null>(null)
  const [activeSignal, setActiveSignal] = useState(0)

  const vehicleIcons = {
    car: Car,
    bus: Bus,
    truck: Truck,
    bike: Bike,
    rickshaw: Bike
  }

  const getVehicleTypeCount = () => {
    const counts: Record<string, number> = {}
    lanes.forEach(lane => {
      lane.vehicleDetections.forEach(detection => {
        counts[detection.label] = (counts[detection.label] || 0) + 1
      })
    })
    return counts
  }

  const vehicleCounts = getVehicleTypeCount()

  useEffect(() => {
    const totalCycleTime = signalTimings.reduce((sum, timing) => sum + timing.green + timing.yellow, 0)
    if (totalCycleTime === 0) return

    const timer = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime >= totalCycleTime) {
          return 0
        }
        return prevTime + 0.1
      })
    }, 100)

    return () => clearInterval(timer)
  }, [signalTimings])

  if (!lanes || lanes.length === 0) {
    return (
      <div className="text-gray-500">No traffic data to display.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Intersection Traffic Analysis</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{data.processingTime.toFixed(2)}s</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>{data.intersectionData.totalVehicles} vehicles</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>{(data.intersectionData.efficiency * 100).toFixed(1)}% efficiency</span>
            </div>
          </div>
        </div>

        {/* Intersection Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Lane Traffic Summary</h3>
            <div className="space-y-3">
              {lanes.map((lane) => {
                const DirectionIcon = ICONS[lane.direction as keyof typeof ICONS] || ArrowUp
                const intensityColor = INTENSITY_COLORS[lane.trafficIntensity]
                
                return (
                  <div 
                    key={lane.id} 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLane === lane.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLane(selectedLane === lane.id ? null : lane.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <DirectionIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{lane.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${intensityColor}`}>
                          {lane.trafficIntensity}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{lane.vehicleCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Avg Speed: {lane.averageSpeed.toFixed(1)} km/h</span>
                      <span>{lane.vehicleDetections.length} detections</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Signal Timing Distribution</h3>
            <div className="space-y-3">
              {signalTimings.map((timing, index) => {
                const DirectionIcon = ICONS[timing.direction as keyof typeof ICONS] || ArrowUp
                const intensityColor = INTENSITY_COLORS[timing.trafficIntensity]
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <DirectionIcon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{timing.direction} - Lane {timing.lane}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${intensityColor}`}>
                          {timing.trafficIntensity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                        <div className="flex items-center text-sm">
                          <span className="w-16 font-medium text-gray-700">Priority:</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(timing.priority || 0) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-green-100 rounded">
                        <div className="traffic-light traffic-light-green mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-green-800">{timing.green}s</span>
                      </div>
                      <div className="text-center p-2 bg-yellow-100 rounded">
                        <div className="traffic-light traffic-light-yellow mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-yellow-800">{timing.yellow}s</span>
                      </div>
                      <div className="text-center p-2 bg-red-100 rounded">
                        <div className="traffic-light traffic-light-red mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-red-800">{timing.red}s</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-900">Total Cycle Time:</span>
                <span className="font-semibold text-blue-900">{data.intersectionData.cycleTime}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vehicle Type Distribution</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(vehicleCounts).map(([type, count]) => {
              const IconComponent = vehicleIcons[type as keyof typeof vehicleIcons] || Car
              return (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-primary-600" />
                    <div>
                      <span className="font-medium capitalize">{type}</span>
                      <p className="text-sm text-gray-600">{count} vehicles</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Analytics Summary */}
        {data.analytics && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Traffic Analytics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">Average Speed</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{data.analytics.averageSpeed.toFixed(1)} km/h</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Car className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">Congestion Level</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.analytics.congestionLevel === 'low' ? 'bg-green-100 text-green-800' :
                  data.analytics.congestionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.analytics.congestionLevel}
                </span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">System Efficiency</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{(data.intersectionData.efficiency * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Download Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Download Results</h3>
              <p className="text-sm text-gray-600">Get the intersection analysis and signal timing data</p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 