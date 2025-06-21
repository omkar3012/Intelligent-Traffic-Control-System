'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, Image, File, Loader2, Plus, X, Car, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { TrafficData, LaneUpload } from '@/types/traffic'

interface FileUploadProps {
  onFileProcessed: (data: TrafficData) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

const LANE_DIRECTIONS = [
  { id: 'north', name: 'North', icon: ArrowUp, color: 'text-blue-600' },
  { id: 'south', name: 'South', icon: ArrowDown, color: 'text-green-600' },
  { id: 'east', name: 'East', icon: ArrowRight, color: 'text-red-600' },
  { id: 'west', name: 'West', icon: ArrowLeft, color: 'text-purple-600' },
]

export default function FileUpload({ onFileProcessed, isProcessing, setIsProcessing }: FileUploadProps) {
  const [laneUploads, setLaneUploads] = useState<LaneUpload[]>([])
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);

  const addLane = () => {
    const newLane: LaneUpload = {
      id: `lane-${Date.now()}`,
      name: `Lane ${laneUploads.length + 1}`,
      direction: 'north',
      file: null as any
    }
    setLaneUploads([...laneUploads, newLane])
  }

  const removeLane = (id: string) => {
    setLaneUploads(laneUploads.filter(lane => lane.id !== id))
  }

  const updateLaneDirection = (id: string, direction: string) => {
    setLaneUploads(laneUploads.map(lane => 
      lane.id === id ? { ...lane, direction } : lane
    ))
  }

  const updateLaneName = (id: string, name: string) => {
    setLaneUploads(laneUploads.map(lane => 
      lane.id === id ? { ...lane, name } : lane
    ))
  }

  const onDrop = useCallback((acceptedFiles: File[], laneId: string) => {
    const file = acceptedFiles[0]
    if (file) {
      const MAX_FILE_SIZE = 4 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum allowed size is 4MB.`);
        return;
      }
      setLaneUploads(laneUploads.map(lane =>
        lane.id === laneId ? { ...lane, file } : lane
      ));
      toast.success(`File "${file.name}" uploaded for ${laneUploads.find(l => l.id === laneId)?.name}`);
    }
  }, [laneUploads]);
  

  const processFiles = async () => {
    const lanesWithFiles = laneUploads.filter(lane => lane.file)
    if (lanesWithFiles.length === 0) {
      toast.error('Please upload at least one video file')
      return
    }
    setProcessingStartTime(Date.now());
    setIsProcessing(true)
    toast.loading('Processing intersection data...', { id: 'processing' })
    
    try {
      const formData = new FormData()
      formData.append('lanes', JSON.stringify(lanesWithFiles.map(lane => ({
        id: lane.id,
        name: lane.name,
        direction: lane.direction
      }))))
      
      lanesWithFiles.forEach(lane => {
        formData.append(`file_${lane.id}`, lane.file)
      })

      const response = await fetch('https://intelligent-traffic-control-system.onrender.com/process-video', {
        method: 'POST',
        body: formData,
      })

      console.log("Raw backend response:", response);
      const result = await response.json()
      console.log("Backend response JSON:", result);

      if (response.ok) {
        toast.success('Intersection processed successfully!', { id: 'processing' })
        const trafficData = mapBackendResponseToTrafficData(result, lanesWithFiles, processingStartTime)
        onFileProcessed(trafficData)
      } else {
        toast.error(result.error || 'Processing failed', { id: 'processing' })
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process intersection', { id: 'processing' })
    } finally {
      setIsProcessing(false)
      setProcessingStartTime(null);
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6 text-blue-500" />
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6 text-green-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const LaneDropzone = ({ lane }: { lane: LaneUpload }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, lane.id),
      accept: {
        'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
        'image/*': ['.jpg', '.jpeg', '.png', '.bmp']
      },
      maxFiles: 1,
      disabled: isProcessing
    })

    const directionConfig = LANE_DIRECTIONS.find(d => d.id === lane.direction)
    const DirectionIcon = directionConfig?.icon || ArrowUp

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={lane.name}
              onChange={(e) => updateLaneName(lane.id, e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              disabled={isProcessing}
            />
            <select
              value={lane.direction}
              onChange={(e) => updateLaneDirection(lane.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isProcessing}
            >
              {LANE_DIRECTIONS.map(dir => (
                <option key={dir.id} value={dir.id}>{dir.name}</option>
              ))}
            </select>
            <DirectionIcon className={`h-4 w-4 ${directionConfig?.color}`} />
          </div>
          <button
            onClick={() => removeLane(lane.id)}
            disabled={isProcessing}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          
          {lane.file ? (
            <div className="flex items-center space-x-3">
              {getFileIcon(lane.file)}
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-sm">{lane.file.name}</p>
                <p className="text-xs text-gray-500">
                  {(lane.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop video here...' : 'Click or drag video file'}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Intersection Traffic Analysis</h2>
          <button
            onClick={addLane}
            disabled={isProcessing || laneUploads.length >= 8}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lane</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {laneUploads.map(lane => (
            <div key={lane.id} className="card bg-gray-50">
              <LaneDropzone lane={lane} />
            </div>
          ))}
        </div>

        {laneUploads.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No lanes added yet</p>
            <button
              onClick={addLane}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Lane
            </button>
          </div>
        )}

        {laneUploads.length > 0 && (
          <div className="mt-6">
            <button
              onClick={processFiles}
              disabled={laneUploads.filter(l => l.file).length === 0 || isProcessing}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Analyze Intersection'
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">Multi-Lane Detection</h3>
          <p className="text-sm text-gray-600">
            Upload videos from multiple directions to analyze intersection traffic patterns
          </p>
        </div>
        
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">Intelligent Timing</h3>
          <p className="text-sm text-gray-600">
            Exponential algorithm distributes green time based on traffic intensity per lane
          </p>
        </div>
        
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-2">Real-time Optimization</h3>
          <p className="text-sm text-gray-600">
            Dynamic signal timing that adapts to changing traffic conditions
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Simulation Logic moved from API route ---

function getTrafficIntensity(vehicleCount: number): 'low' | 'medium' | 'high' {
  if (vehicleCount < 20) return 'low'
  if (vehicleCount < 50) return 'medium'
  return 'high'
}

function calculateSignalTimings(lanes: any[]) {
  const baseGreenTime = 20
  const maxGreenTime = 60
  const yellowTime = 3
  
  if (lanes.length === 0) return [];

  const totalIntensity = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0)
  if (totalIntensity === 0) {
    return lanes.map((lane, index) => ({
      ...lane,
      lane: index + 1,
      priority: 0,
      green: baseGreenTime,
      yellow: yellowTime,
      red: baseGreenTime * (lanes.length - 1) + yellowTime * lanes.length,
    }));
  }

  const signalTimingsWithWeight = lanes.map((lane) => {
    const intensityWeight = Math.exp(lane.vehicleCount / 20) - 1;
    return { ...lane, intensityWeight };
  });

  const totalWeight = signalTimingsWithWeight.reduce((sum, lane) => sum + lane.intensityWeight, 0);

  let totalGreenTime = 0;
  const finalTimings = signalTimingsWithWeight.map((lane) => {
    let greenTime;
    if (totalWeight === 0) {
      greenTime = baseGreenTime;
    } else {
      const proportion = lane.intensityWeight / totalWeight;
      greenTime = Math.max(baseGreenTime, Math.min(maxGreenTime, Math.round(proportion * (maxGreenTime * lanes.length))));
    }
    totalGreenTime += greenTime;
    return { ...lane, green: greenTime, yellow: yellowTime };
  });

  return finalTimings.map((timing, index) => ({
    ...timing,
    lane: index + 1,
    priority: timing.intensityWeight,
    red: totalGreenTime - timing.green + yellowTime * (lanes.length - 1),
  }));
}

function calculateEfficiency(lanes: any[], signalTimings: any[]): number {
  if (lanes.length === 0 || signalTimings.length === 0) return 0;
  
  const totalVehicles = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0)
  if (totalVehicles === 0) return 1;

  const totalGreenTime = signalTimings.reduce((sum, timing) => sum + timing.green, 0)
  if (totalGreenTime === 0) return 0;
  
  const efficiency = lanes.reduce((sum, lane, index) => {
    const signal = signalTimings.find(s => s.id === lane.id);
    if (!signal) return sum;

    const expectedGreenTime = (lane.vehicleCount / totalVehicles) * totalGreenTime
    const actualGreenTime = signal.green;
    const deviation = expectedGreenTime > 0 ? Math.abs(expectedGreenTime - actualGreenTime) / expectedGreenTime : 0;
    return sum + (1 - deviation)
  }, 0) / lanes.length

  return Math.max(0, Math.min(1, efficiency))
}

function getCongestionLevel(totalVehicles: number): 'low' | 'medium' | 'high' {
  if (totalVehicles < 50) return 'low';
  if (totalVehicles < 150) return 'medium';
  return 'high';
}

function generateRecommendations(lanes: any[]): string[] {
  const recommendations: string[] = [];
  const highTrafficLanes = lanes.filter(lane => lane.trafficIntensity === 'high');

  if (highTrafficLanes.length > 0) {
    recommendations.push('Consider extending green time for high-traffic directions');
  }
  if (lanes.some(lane => lane.vehicleCount > 40)) {
    recommendations.push('Implement dynamic signal timing based on real-time vehicle density');
  }
  if (lanes.length > 2) {
    recommendations.push('Optimize signal coordination between multiple approaches');
  }

  recommendations.push('Monitor traffic patterns for optimal signal timing');

  return recommendations;
}

function calculateLaneEfficiency(lanes: any[], signalTimings: any[]): Record<string, number> {
    if (lanes.length === 0 || signalTimings.length === 0) return {};
    const totalVehicles = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0);
    const totalGreenTime = signalTimings.reduce((sum, timing) => sum + timing.green, 0);
  
    if (totalVehicles === 0 || totalGreenTime === 0) {
      return lanes.reduce((acc, lane) => {
        acc[lane.id] = 1; // Perfect efficiency if no traffic
        return acc;
      }, {} as Record<string, number>);
    }
  
    return lanes.reduce((acc, lane) => {
      const signal = signalTimings.find(s => s.id === lane.id);
      if (!signal) {
        acc[lane.id] = 0;
        return acc;
      }
      const expectedGreenTime = (lane.vehicleCount / totalVehicles) * totalGreenTime;
      const actualGreenTime = signal.green;
      const deviation = expectedGreenTime > 0 ? Math.abs(expectedGreenTime - actualGreenTime) / expectedGreenTime : 0;
      acc[lane.id] = Math.max(0, 1 - deviation);
      return acc;
    }, {} as Record<string, number>);
}

// Helper function to map the new backend response to the existing TrafficData type
function mapBackendResponseToTrafficData(backendData: any, lanes: LaneUpload[], startTime: number | null): TrafficData {
  
  const laneResults = lanes.map(lane => {
    const backendLaneData = backendData[lane.id] || {};
    const vehicleCount = backendLaneData.vehicle_count ?? 0;
    return {
      id: lane.id,
      name: lane.name,
      direction: lane.direction,
      vehicleCount: vehicleCount,
      trafficIntensity: getTrafficIntensity(vehicleCount),
      averageSpeed: 25 + Math.random() * 15, // Mocked for now
      // vehicleDetections are not provided by the current backend, so we pass an empty array
      vehicleDetections: [], 
    };
  });

  const totalVehicles = laneResults.reduce((sum, lane) => sum + lane.vehicleCount, 0);
  const signalTimings = calculateSignalTimings(laneResults);
  const cycleTime = signalTimings.reduce((sum, timing) => sum + timing.green + timing.yellow, 0);
  const efficiency = calculateEfficiency(laneResults, signalTimings);
  const processingTime = startTime ? (Date.now() - startTime) / 1000 : 0;

  // Since we don't have detailed detections, we'll generate a simplified vehicle type count.
  const vehicleTypes = laneResults.reduce((acc, lane) => {
    acc['car'] = (acc['car'] || 0) + lane.vehicleCount;
    return acc;
  }, {} as Record<string, number>);


  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    intersectionData: {
      lanes: laneResults,
      totalVehicles,
      signalTimings,
      cycleTime,
      efficiency,
    },
    processingTime: processingTime,
    originalFiles: lanes.map(l => l.file.name),
    analytics: {
      vehicleTypes: vehicleTypes,
      averageSpeed: laneResults.reduce((sum, lane) => sum + lane.averageSpeed, 0) / (laneResults.length || 1),
      congestionLevel: getCongestionLevel(totalVehicles),
      recommendations: generateRecommendations(laneResults),
      laneEfficiency: calculateLaneEfficiency(laneResults, signalTimings),
    },
  };
} 