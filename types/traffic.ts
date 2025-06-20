export interface VehicleDetection {
  label: string
  confidence: number
  topleft: { x: number; y: number }
  bottomright: { x: number; y: number }
}

export interface LaneData {
  id: string
  name: string
  direction: string
  vehicleCount: number
  vehicleDetections: VehicleDetection[]
  trafficIntensity: 'low' | 'medium' | 'high'
  averageSpeed: number
}

export interface SignalTiming {
  green: number
  yellow: number
  red: number
  direction: string
  lane: number
  trafficIntensity: 'low' | 'medium' | 'high'
  priority?: number
}

export interface IntersectionData {
  lanes: LaneData[]
  totalVehicles: number
  signalTimings: SignalTiming[]
  cycleTime: number
  efficiency: number
}

export interface TrafficData {
  id: string
  timestamp: string
  intersectionData: IntersectionData
  processingTime: number
  originalFiles: string[]
  processedFiles?: string[]
  analytics?: {
    vehicleTypes: Record<string, number>
    averageSpeed: number
    congestionLevel: 'low' | 'medium' | 'high'
    recommendations: string[]
    laneEfficiency: Record<string, number>
  }
}

export interface ProcessingResult {
  success: boolean
  data?: TrafficData
  error?: string
  message?: string
}

export interface UploadResponse {
  success: boolean
  fileId?: string
  error?: string
}

export interface LaneUpload {
  id: string
  name: string
  direction: string
  file: File
} 