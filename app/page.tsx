'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FileUpload from '@/components/FileUpload'
import TrafficDisplay from '@/components/TrafficDisplay'
import SignalControl from '@/components/SignalControl'
import Analytics from '@/components/Analytics'
import { TrafficData } from '@/types/traffic'

export default function Home() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'display' | 'control' | 'analytics'>('upload')

  const handleFileProcessed = (data: TrafficData) => {
    setTrafficData(data)
    setActiveTab('display')
  }

  const tabs = [
    { id: 'upload', name: 'Upload & Process', icon: '📁' },
    { id: 'display', name: 'Traffic Display', icon: '🚗' },
    { id: 'control', name: 'Signal Control', icon: '🚦' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'upload' && (
            <FileUpload 
              onFileProcessed={handleFileProcessed}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          )}
          
          {activeTab === 'display' && trafficData && (
            <TrafficDisplay data={trafficData} />
          )}
          
          {activeTab === 'control' && (
            <SignalControl data={trafficData} />
          )}
          
          {activeTab === 'analytics' && trafficData && (
            <Analytics data={trafficData} />
          )}
        </div>
      </main>
    </div>
  )
} 