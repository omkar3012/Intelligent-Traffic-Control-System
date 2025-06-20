'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, TrendingUp, Clock, Zap, Sun, Wind, Moon } from 'lucide-react'
import { TrafficData } from '@/types/traffic'

interface SignalControlProps {
  data: TrafficData | null
}

const DIRECTION_ICONS = {
  north: ArrowUp,
  south: ArrowDown,
  east: ArrowRight,
  west: ArrowLeft
}

const INTENSITY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100'
}

// Traffic Light Animation Component
const TrafficLightAnimation = ({ 
  signalTimings, 
  currentSignal, 
  isRunning,
  onSignalComplete,
  speed
}: { 
  signalTimings: any[]
  currentSignal: number
  isRunning: boolean
  onSignalComplete: () => void
  speed: number
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [phase, setPhase] = useState<'green' | 'yellow' | 'red'>('green')
  const [currentPhaseTime, setCurrentPhaseTime] = useState(0)

  useEffect(() => {
    if (!isRunning || signalTimings.length === 0) {
      setTimeRemaining(0)
      setPhase('red')
      setCurrentPhaseTime(0)
      return
    }

    const currentTiming = signalTimings[currentSignal]
    if (!currentTiming) return

    // Calculate total time for this signal (green + yellow)
    const greenTime = currentTiming.green
    const yellowTime = currentTiming.yellow
    const totalTime = greenTime + yellowTime

    console.log(`Animation: Signal ${currentSignal + 1} (${currentTiming.direction}) - Green: ${greenTime}s, Yellow: ${yellowTime}s, Total: ${totalTime}s`)

    setTimeRemaining(totalTime)
    setCurrentPhaseTime(0)
    setPhase('green')

    const intervalTime = 500 / speed // Adjust interval based on speed

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 0.5 // 500ms intervals
        
        if (newTime <= 0) {
          clearInterval(interval)
          setPhase('red')
          setCurrentPhaseTime(0)
          onSignalComplete()
          return 0
        }
        
        // Determine current phase
        if (newTime > yellowTime) {
          setPhase('green')
          setCurrentPhaseTime(totalTime - newTime)
        } else {
          setPhase('yellow')
          setCurrentPhaseTime(greenTime + (yellowTime - newTime))
        }
        
        return newTime
      })
    }, intervalTime) // Speed up to 500ms for faster visualization

    return () => clearInterval(interval)
  }, [currentSignal, isRunning, signalTimings, onSignalComplete, speed])

  const getDirectionPosition = (direction: string) => {
    switch (direction) {
      case 'north': return { top: '0%', left: '50%', transform: 'translateX(-50%)' }
      case 'south': return { bottom: '0%', left: '50%', transform: 'translateX(-50%)' }
      case 'east': return { right: '0%', top: '50%', transform: 'translateY(-50%)' }
      case 'west': return { left: '0%', top: '50%', transform: 'translateY(-50%)' }
      default: return { top: '0%', left: '0%' }
    }
  }

  const getDirectionRotation = (direction: string) => {
    switch (direction) {
      case 'north': return 'rotate(0deg)'
      case 'south': return 'rotate(180deg)'
      case 'east': return 'rotate(90deg)'
      case 'west': return 'rotate(-90deg)'
      default: return 'rotate(0deg)'
    }
  }

  const getSignalState = (signalIndex: number) => {
    if (signalIndex === currentSignal) {
      return phase
    } else {
      return 'red'
    }
  }

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden">
      {/* Intersection Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full z-10 flex items-center justify-center">
        <div className="text-white text-xs font-bold">INTERSECTION</div>
      </div>

      {/* Traffic Lights */}
      {signalTimings.map((signal, index) => {
        const position = getDirectionPosition(signal.direction)
        const rotation = getDirectionRotation(signal.direction)
        const signalState = getSignalState(index)
        const DirectionIcon = DIRECTION_ICONS[signal.direction as keyof typeof DIRECTION_ICONS] || ArrowUp

        return (
          <div
            key={index}
            className="absolute z-20"
            style={position}
          >
            <div 
              className="relative"
              style={{ transform: rotation }}
            >
              {/* Traffic Light Housing */}
              <div className="w-8 h-20 bg-gray-800 rounded-lg border-2 border-gray-600 flex flex-col items-center justify-center space-y-1 p-1">
                {/* Red Light */}
                <div className={`w-4 h-4 rounded-full border ${
                  signalState === 'red' ? 'bg-red-500 shadow-lg shadow-red-300' : 'bg-gray-400'
                }`}></div>
                
                {/* Yellow Light */}
                <div className={`w-4 h-4 rounded-full border ${
                  signalState === 'yellow' ? 'bg-yellow-500 shadow-lg shadow-yellow-300' : 'bg-gray-400'
                }`}></div>
                
                {/* Green Light */}
                <div className={`w-4 h-4 rounded-full border ${
                  signalState === 'green' ? 'bg-green-500 shadow-lg shadow-green-300' : 'bg-gray-400'
                }`}></div>
              </div>

              {/* Direction Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded shadow text-xs font-medium">
                  <DirectionIcon className="h-3 w-3" />
                  <span className="capitalize">{signal.direction}</span>
                </div>
                {index === currentSignal && (
                  <div className="mt-1 text-xs font-bold text-primary-600">
                    {timeRemaining.toFixed(1)}s
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Vehicle Flow Indicators (Progress Bars) */}
      {signalTimings.map((signal, index) => {
        const signalState = getSignalState(index)
        const position = getDirectionPosition(signal.direction)
        const maxWidth = 80 // 5rem in pixels
        
        let progressWidth = 0
        let progressColor = 'bg-red-500'

        if (index === currentSignal) {
          const currentTiming = signalTimings[currentSignal]
          if (!currentTiming) return null
          const greenTime = currentTiming.green
          const yellowTime = currentTiming.yellow

          if (phase === 'green') {
            progressColor = 'bg-green-500'
            // Calculate remaining green time percentage
            progressWidth = ((timeRemaining - yellowTime) / greenTime) * maxWidth
          } else if (phase === 'yellow') {
            progressColor = 'bg-yellow-500'
            // Calculate remaining yellow time percentage
            progressWidth = (timeRemaining / yellowTime) * maxWidth
          }
        } else {
          // For red lights, the bar is full
          progressWidth = maxWidth
        }
        
        progressWidth = Math.max(0, Math.min(maxWidth, progressWidth))

        // Adjust position to be next to the traffic light
        const transformOffset = '60px'
        let transform = position.transform || ''
        switch(signal.direction) {
          case 'north': transform += ` translateY(${transformOffset})`; break;
          case 'south': transform += ` translateY(-${transformOffset})`; break;
          case 'east': transform += ` translateX(-${transformOffset})`; break;
          case 'west': transform += ` translateX(${transformOffset})`; break;
        }

        return (
          <div
            key={`flow-${index}`}
            className="absolute z-5"
            style={{ ...position, transform }}
          >
            <div className="w-20 h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
              <div
                className={`h-full rounded-full transition-all duration-200 ease-linear ${progressColor}`}
                style={{ width: `${progressWidth}px` }}
              ></div>
            </div>
          </div>
        )
      })}

      {/* Current Phase Indicator */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-800 mb-2">Current Phase</div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            phase === 'green' ? 'bg-green-500' : 
            phase === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium capitalize">{phase}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {signalTimings[currentSignal]?.direction} direction
        </div>
        <div className="text-xs text-gray-600">
          Phase time: {currentPhaseTime.toFixed(1)}s
        </div>
      </div>

      {/* Timer Display */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-800 mb-2">Time Remaining</div>
        <div className="text-2xl font-bold text-primary-600">{timeRemaining.toFixed(1)}s</div>
        <div className="text-xs text-gray-600">
          Phase {currentSignal + 1} of {signalTimings.length}
        </div>
        <div className="text-xs text-gray-600">
          Speed: {speed}x
        </div>
      </div>

      {/* Traffic Flow Animation */}
      {isRunning && signalTimings.map((signal, index) => {
        const signalState = getSignalState(index)
        const position = getDirectionPosition(signal.direction)
        
        if (signalState !== 'green') return null

        return (
          <div
            key={`traffic-${index}`}
            className="absolute z-15"
            style={position}
          >
            <div className="animate-bounce">
              <div className="w-4 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        )
      })}

      {/* Cycle Progress Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-gray-800 mb-2">Cycle Progress</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${((currentSignal + (timeRemaining / (signalTimings[currentSignal]?.green + signalTimings[currentSignal]?.yellow || 1))) / signalTimings.length) * 100}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Start</span>
          <span>{Math.round(((currentSignal + (timeRemaining / (signalTimings[currentSignal]?.green + signalTimings[currentSignal]?.yellow || 1))) / signalTimings.length) * 100)}%</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  )
}

export default function SignalControl({ data }: SignalControlProps) {
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSignal, setCurrentSignal] = useState(0)
  const [editedTimings, setEditedTimings] = useState<any[] | null>(null)

  const originalTimings = data?.intersectionData.signalTimings
  const signalTimings = editedTimings || originalTimings || []

  useEffect(() => {
    if (data?.intersectionData) {
      const timings = data.intersectionData.signalTimings
      setSignalTimings(timings)
    }
    // When trafficData changes, reset the simulation
    resetSimulation()
  }, [data])

  const handleSignalComplete = useCallback(() => {
    setCurrentSignal((prev) => (prev + 1) % (signalTimings.length || 1))
  }, [signalTimings.length])

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    if (!isRunning) {
      setCurrentSignal(0)
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentSignal(0)
    setEditedTimings(null)
  }

  const updateSignalTiming = (index: number, field: 'green' | 'yellow' | 'red', value: number) => {
    const currentTimings = editedTimings || originalTimings || [];
    const newTimings = currentTimings.map((timing, i) => {
      if (i === index) {
        return { ...timing, [field]: Math.max(0, value) };
      }
      return timing;
    });
    setEditedTimings(newTimings);
  };

  const getCurrentLaneData = () => {
    if (!data || !signalTimings[currentSignal]) return null
    return data.intersectionData.lanes.find(
      (lane) => lane.direction === signalTimings[currentSignal].direction
    )
  }

  const totalCycleTime = signalTimings.reduce((acc, timing) => acc + timing.green + timing.yellow, 0)
  const currentLaneData = getCurrentLaneData()

  if (!data) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold text-gray-900">Intersection Signal Control</h2>
        <p>No traffic data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Intersection Signal Control</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSimulation}
                className={`btn-primary flex items-center space-x-2 ${isRunning ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isRunning ? 'Stop' : 'Start'} Simulation</span>
              </button>
              <button
                onClick={resetSimulation}
                className="btn-secondary flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Speed:</span>
              {[1, 2, 4].map(speedValue => (
                <button
                  key={speedValue}
                  onClick={() => setSimulationSpeed(speedValue)}
                  className={`btn-secondary px-3 py-1 text-sm ${
                    simulationSpeed === speedValue ? 'bg-primary-100 border-primary-500' : ''
                  }`}
                >
                  {speedValue}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Light Animation */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Live Intersection View</h3>
          <TrafficLightAnimation 
            signalTimings={signalTimings}
            currentSignal={currentSignal}
            isRunning={isRunning}
            onSignalComplete={handleSignalComplete}
            speed={simulationSpeed}
          />
        </div>

        {/* Traffic Signal Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {signalTimings.map((signal: any, index) => {
            const DirectionIcon = DIRECTION_ICONS[signal.direction as keyof typeof DIRECTION_ICONS] || ArrowUp
            const intensityColor = INTENSITY_COLORS[signal.trafficIntensity as keyof typeof INTENSITY_COLORS] || INTENSITY_COLORS.low
            const isActive = currentSignal === index
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DirectionIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">{signal.direction}</h3>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${intensityColor}`}>
                      {signal.trafficIntensity}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Green:</span>
                    <input
                      type="number"
                      value={signal.green}
                      onChange={(e) => updateSignalTiming(index, 'green', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      min="5"
                      max="60"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Yellow:</span>
                    <input
                      type="number"
                      value={signal.yellow}
                      onChange={(e) => updateSignalTiming(index, 'yellow', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      min="3"
                      max="10"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Red:</span>
                    <input
                      type="number"
                      value={signal.red}
                      onChange={(e) => updateSignalTiming(index, 'red', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      min="5"
                      max="60"
                    />
                  </div>
                  <div className="text-center text-xs text-gray-600 mt-2">
                    Priority: {signal.priority?.toFixed(1) || 'N/A'}
                  </div>
                  {isActive && (
                    <div className="text-center text-xs text-primary-600 font-medium">
                      ACTIVE
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Lane Information */}
        {currentLaneData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Current Active Lane</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-600">Lane Name</p>
                <p className="font-semibold text-blue-900">{currentLaneData.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Vehicle Count</p>
                <p className="font-semibold text-blue-900">{currentLaneData.vehicleCount}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Traffic Intensity</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${INTENSITY_COLORS[currentLaneData.trafficIntensity]}`}>
                  {currentLaneData.trafficIntensity}
                </span>
              </div>
              <div>
                <p className="text-sm text-blue-600">Average Speed</p>
                <p className="font-semibold text-blue-900">{currentLaneData.averageSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Flow Status */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Current Flow</h3>
            <p className="text-green-700">
              {signalTimings[currentSignal]?.direction} direction is active
            </p>
            <p className="text-sm text-green-600 mt-1">
              Phase {currentSignal + 1} of {signalTimings.length}
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Next Signal</h3>
            <p className="text-blue-700">
              {signalTimings[(currentSignal + 1) % signalTimings.length]?.direction} direction
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Phase {(currentSignal + 2) % signalTimings.length || signalTimings.length}
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">Optimization</h3>
            <p className="text-orange-700">
              AI-adjusted timings
            </p>
            <p className="text-sm text-orange-600 mt-1">
              Based on traffic intensity
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Cycle Time</h3>
            <p className="text-purple-700">
              {totalCycleTime}s total cycle
            </p>
            <p className="text-sm text-purple-600 mt-1">
              {signalTimings.length} phases
            </p>
          </div>
        </div>
      </div>

      {/* Traffic Statistics */}
      {data && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intersection Statistics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-primary-600">{data.intersectionData.totalVehicles}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold text-primary-600">{data.processingTime.toFixed(2)}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">System Efficiency</p>
              <p className="text-2xl font-bold text-primary-600">{(data.intersectionData.efficiency * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Lanes</p>
              <p className="text-2xl font-bold text-primary-600">{data.intersectionData.lanes.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 