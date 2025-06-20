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
      const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum allowed size is 4MB.`)
        return
      }
      setLaneUploads(laneUploads.map(lane => 
        lane.id === laneId ? { ...lane, file } : lane
      ))
      toast.success(`File "${file.name}" uploaded for ${laneUploads.find(l => l.id === laneId)?.name}`)
    }
  }, [laneUploads])

  const processFiles = async () => {
    const lanesWithFiles = laneUploads.filter(lane => lane.file)
    
    if (lanesWithFiles.length === 0) {
      toast.error('Please upload at least one video file')
      return
    }

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

      const response = await fetch('/api/process-intersection', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Intersection processed successfully!', { id: 'processing' })
        onFileProcessed(result.data)
      } else {
        toast.error(result.error || 'Processing failed', { id: 'processing' })
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process intersection', { id: 'processing' })
    } finally {
      setIsProcessing(false)
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
                  <span>Processing Intersection...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Analyze Intersection</span>
                </>
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