import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface LaneInfo {
  id: string
  name: string
  direction: string
  fileUrl: string
}

export async function POST(request: NextRequest) {
  try {
    const { lanes } = await request.json() as { lanes: LaneInfo[] }

    if (!lanes || lanes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No lanes provided' },
        { status: 400 }
      )
    }

    // Simulate vehicle detection for each lane
    const laneResults = lanes.map(lane => {
      // --- JS mock vehicle detection ---
      const totalFrames = 900
      const sampleInterval = 30
      let vehicleCountTotal = 0
      let frameCount = 0
      for (let i = 0; i < totalFrames; i++) {
        frameCount++
        if (frameCount % sampleInterval === 0) {
          const vehiclesInFrame = Math.floor(Math.random() * 9)
          vehicleCountTotal += vehiclesInFrame
        }
      }
      const processedFrames = Math.floor(frameCount / sampleInterval)
      const averageVehicles = vehicleCountTotal / Math.max(processedFrames, 1)
      // --- End JS mock ---
      return {
        id: lane.id,
        name: lane.name,
        direction: lane.direction,
        fileUrl: lane.fileUrl,
        vehicleCount: vehicleCountTotal,
        averageVehicles,
        processedFrames,
        totalFrames,
        trafficIntensity: getTrafficIntensity(vehicleCountTotal),
        averageSpeed: 25 + Math.random() * 15 // Mock speed data
      }
    })

    // Calculate intelligent signal timings using exponential algorithm
    const signalTimings = calculateSignalTimings(laneResults)
    const totalVehicles = laneResults.reduce((sum, lane) => sum + lane.vehicleCount, 0)
    const cycleTime = signalTimings.reduce((sum, timing) => sum + timing.green + timing.yellow + timing.red, 0)
    const efficiency = calculateEfficiency(laneResults, signalTimings)

    const result = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      intersectionData: {
        lanes: laneResults.map(lane => ({
          id: lane.id,
          name: lane.name,
          direction: lane.direction,
          vehicleCount: lane.vehicleCount,
          vehicleDetections: generateMockDetections(lane.vehicleCount),
          trafficIntensity: lane.trafficIntensity,
          averageSpeed: lane.averageSpeed
        })),
        totalVehicles,
        signalTimings,
        cycleTime,
        efficiency
      },
      processingTime: Date.now() - Date.now(), // Will be calculated properly
      originalFiles: [],
      analytics: {
        vehicleTypes: countVehicleTypes(laneResults),
        averageSpeed: laneResults.reduce((sum, lane) => sum + lane.averageSpeed, 0) / laneResults.length,
        congestionLevel: getCongestionLevel(totalVehicles),
        recommendations: generateRecommendations(laneResults),
        laneEfficiency: calculateLaneEfficiency(laneResults)
      }
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process intersection' },
      { status: 500 }
    )
  }
}

function parseVehicleCount(pythonOutput: string): number {
  const totalMatch = pythonOutput.match(/Total vehicles detected: (\d+)/)
  return totalMatch ? parseInt(totalMatch[1]) : Math.floor(Math.random() * 50) + 10
}

function getTrafficIntensity(vehicleCount: number): 'low' | 'medium' | 'high' {
  if (vehicleCount < 20) return 'low'
  if (vehicleCount < 50) return 'medium'
  return 'high'
}

function calculateSignalTimings(lanes: any[]) {
  const baseGreenTime = 20
  const maxGreenTime = 60
  const yellowTime = 3
  const redTime = 30

  // Calculate total traffic intensity
  const totalIntensity = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0)
  
  // Use exponential algorithm to distribute green time
  const signalTimings = lanes.map((lane, index) => {
    // Exponential weight based on vehicle count
    const intensityWeight = Math.exp(lane.vehicleCount / 20) - 1
    const totalWeight = lanes.reduce((sum, l) => sum + Math.exp(l.vehicleCount / 20) - 1, 0)
    
    // Calculate green time proportionally with better distribution
    let greenTime
    if (totalWeight === 0) {
      greenTime = baseGreenTime
    } else {
      const proportion = intensityWeight / totalWeight
      greenTime = Math.max(
        baseGreenTime,
        Math.min(
          maxGreenTime,
          Math.round(proportion * (maxGreenTime * lanes.length))
        )
      )
    }

    // Ensure minimum green time
    greenTime = Math.max(greenTime, baseGreenTime)

    return {
      green: greenTime,
      yellow: yellowTime,
      red: redTime,
      direction: lane.direction,
      lane: index + 1,
      trafficIntensity: lane.trafficIntensity,
      priority: intensityWeight
    }
  })

  return signalTimings
}

function calculateEfficiency(lanes: any[], signalTimings: any[]): number {
  // Calculate efficiency based on how well traffic is distributed
  const totalVehicles = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0)
  const totalGreenTime = signalTimings.reduce((sum, timing) => sum + timing.green, 0)
  
  // Efficiency is higher when green time is proportional to vehicle count
  const efficiency = lanes.reduce((sum, lane, index) => {
    const expectedGreenTime = (lane.vehicleCount / totalVehicles) * totalGreenTime
    const actualGreenTime = signalTimings[index]?.green || 0
    const deviation = Math.abs(expectedGreenTime - actualGreenTime) / expectedGreenTime
    return sum + (1 - deviation)
  }, 0) / lanes.length

  return Math.max(0, Math.min(1, efficiency))
}

function generateMockDetections(vehicleCount: number) {
  const mockDetections = [
    { label: 'car', confidence: 0.95, topleft: { x: 100, y: 150 }, bottomright: { x: 200, y: 250 } },
    { label: 'bus', confidence: 0.87, topleft: { x: 300, y: 100 }, bottomright: { x: 450, y: 200 } },
    { label: 'truck', confidence: 0.92, topleft: { x: 500, y: 200 }, bottomright: { x: 650, y: 300 } },
    { label: 'bike', confidence: 0.78, topleft: { x: 150, y: 300 }, bottomright: { x: 180, y: 350 } },
  ]
  
  const count = Math.min(vehicleCount, mockDetections.length)
  return mockDetections.slice(0, count)
}

function countVehicleTypes(lanes: any[]) {
  const types = ['car', 'bus', 'truck', 'bike']
  return types.reduce((acc, type) => {
    acc[type] = Math.floor(Math.random() * 20) + 5
    return acc
  }, {} as Record<string, number>)
}

function getCongestionLevel(totalVehicles: number): 'low' | 'medium' | 'high' {
  if (totalVehicles < 50) return 'low'
  if (totalVehicles < 150) return 'medium'
  return 'high'
}

function generateRecommendations(lanes: any[]): string[] {
  const recommendations = []
  const highTrafficLanes = lanes.filter(lane => lane.trafficIntensity === 'high')
  
  if (highTrafficLanes.length > 0) {
    recommendations.push('Consider extending green time for high-traffic directions')
    recommendations.push('Implement dynamic signal timing based on real-time vehicle density')
  }
  
  if (lanes.length > 2) {
    recommendations.push('Optimize signal coordination between multiple approaches')
    recommendations.push('Consider implementing adaptive signal control system')
  }
  
  recommendations.push('Monitor traffic patterns for optimal signal timing')
  recommendations.push('Continue monitoring for traffic pattern changes')
  
  return recommendations
}

function calculateLaneEfficiency(lanes: any[]): Record<string, number> {
  return lanes.reduce((acc, lane) => {
    acc[lane.id] = Math.random() * 0.4 + 0.6 // 60-100% efficiency
    return acc
  }, {} as Record<string, number>)
} 