'use client'

import { Car, TrafficCone, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <TrafficCone className="h-8 w-8 text-primary-600" />
              <Car className="h-6 w-6 text-primary-500" />
              <Zap className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Intelligent Traffic Control
              </h1>
              <p className="text-sm text-gray-600">
                AI-Powered Signal Optimization
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="traffic-light traffic-light-red"></div>
                <span>Real-time Detection</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="traffic-light traffic-light-yellow"></div>
                <span>Smart Analytics</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="traffic-light traffic-light-green"></div>
                <span>Optimized Flow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 