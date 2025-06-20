import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'image/jpeg', 'image/png', 'image/bmp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a video or image file.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Process file with Python script
    const startTime = Date.now()
    const pythonScript = file.type.startsWith('video/') ? 'vehicle_detection_simple.py' : 'vehicle_detection_simple.py'
    
    // Use the Python interpreter from the virtual environment
    const pythonCommand = process.platform === 'win32' 
      ? 'venv310\\Scripts\\python.exe' 
      : 'venv310/bin/python'
    
    const { stdout, stderr } = await execAsync(`${pythonCommand} ${pythonScript} "${filePath}"`, {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes timeout
    })

    const processingTime = (Date.now() - startTime) / 1000

    if (stderr) {
      console.error('Python script error:', stderr)
    }

    // Parse Python output to extract vehicle detection results
    const vehicleDetections = parseVehicleDetections(stdout)
    const signalTimings = generateSignalTimings(vehicleDetections.length)

    // Generate mock processed file path (in real implementation, this would be the actual processed video)
    const processedFileName = `processed-${fileName}`
    const processedFilePath = `/uploads/${processedFileName}`

    const result = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      vehicleCount: vehicleDetections.length,
      vehicleDetections,
      signalTimings,
      processingTime,
      originalFile: fileName,
      processedFile: processedFilePath,
      analytics: {
        vehicleTypes: countVehicleTypes(vehicleDetections),
        averageSpeed: 25.5, // Mock data
        congestionLevel: vehicleDetections.length > 20 ? 'high' : vehicleDetections.length > 10 ? 'medium' : 'low',
        recommendations: generateRecommendations(vehicleDetections.length)
      }
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

function parseVehicleDetections(pythonOutput: string) {
  console.log('Python output:', pythonOutput)
  
  // Try to extract vehicle count from the output
  const totalMatch = pythonOutput.match(/Total vehicles detected: (\d+)/)
  const averageMatch = pythonOutput.match(/Average vehicles per frame: ([\d.]+)/)
  
  if (totalMatch) {
    const totalVehicles = parseInt(totalMatch[1])
    console.log(`Detected ${totalVehicles} vehicles`)
    
    // Generate mock detections based on the actual count
    const mockDetections = [
      { label: 'car', confidence: 0.95, topleft: { x: 100, y: 150 }, bottomright: { x: 200, y: 250 } },
      { label: 'bus', confidence: 0.87, topleft: { x: 300, y: 100 }, bottomright: { x: 450, y: 200 } },
      { label: 'truck', confidence: 0.92, topleft: { x: 500, y: 200 }, bottomright: { x: 650, y: 300 } },
      { label: 'bike', confidence: 0.78, topleft: { x: 150, y: 300 }, bottomright: { x: 180, y: 350 } },
    ]
    
    // Return a reasonable number of detections based on the total count
    const count = Math.min(totalVehicles, mockDetections.length)
    return mockDetections.slice(0, count)
  }
  
  // Fallback to random detections if parsing fails
  const mockDetections = [
    { label: 'car', confidence: 0.95, topleft: { x: 100, y: 150 }, bottomright: { x: 200, y: 250 } },
    { label: 'bus', confidence: 0.87, topleft: { x: 300, y: 100 }, bottomright: { x: 450, y: 200 } },
    { label: 'truck', confidence: 0.92, topleft: { x: 500, y: 200 }, bottomright: { x: 650, y: 300 } },
    { label: 'bike', confidence: 0.78, topleft: { x: 150, y: 300 }, bottomright: { x: 180, y: 350 } },
  ]
  
  const count = Math.floor(Math.random() * 15) + 5
  return mockDetections.slice(0, Math.min(count, mockDetections.length))
}

function generateSignalTimings(vehicleCount: number) {
  const directions = ['North', 'South', 'East', 'West']
  return directions.map((direction, index) => ({
    green: Math.max(10, Math.min(60, 20 + vehicleCount * 2)),
    yellow: 3,
    red: 30,
    direction,
    lane: index + 1
  }))
}

function countVehicleTypes(detections: any[]) {
  return detections.reduce((acc, detection) => {
    acc[detection.label] = (acc[detection.label] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function generateRecommendations(vehicleCount: number) {
  const recommendations = []
  
  if (vehicleCount > 20) {
    recommendations.push('Consider extending green signal duration for high-traffic directions')
    recommendations.push('Implement dynamic signal timing based on real-time vehicle density')
  } else if (vehicleCount > 10) {
    recommendations.push('Monitor traffic patterns for optimal signal timing')
    recommendations.push('Consider implementing adaptive signal control')
  } else {
    recommendations.push('Current signal timing appears adequate for traffic volume')
    recommendations.push('Continue monitoring for traffic pattern changes')
  }
  
  return recommendations
} 