import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    
    // Forward the request to our FastAPI backend
    const response = await fetch(`${BACKEND_URL}/process-video`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let fetch set it automatically for FormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', response.status, errorText)
      return NextResponse.json(
        { success: false, error: `Backend API error: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    // Transform the backend response to match frontend expectations
    const transformedResult = {
      success: true,
      data: {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        results: result.results || {},
        summary: result.summary || {
          total_vehicles: 0,
          lanes_processed: 0,
          total_lanes: 0,
          traffic_level: 'light'
        },
        processingTime: result.summary?.processing_time || 'Real-time',
        analytics: {
          trafficLevel: result.summary?.traffic_level || 'light',
          totalVehicles: result.summary?.total_vehicles || 0,
          recommendations: generateRecommendations(result.summary?.traffic_level || 'light')
        }
      }
    }

    return NextResponse.json(transformedResult)

  } catch (error) {
    console.error('Frontend API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(trafficLevel: string): string[] {
  const recommendations = []
  
  switch (trafficLevel) {
    case 'heavy':
      recommendations.push('Consider extending green signal duration for high-traffic directions')
      recommendations.push('Implement dynamic signal timing based on real-time vehicle density')
      recommendations.push('Consider traffic rerouting for congestion relief')
      break
    case 'moderate':
      recommendations.push('Monitor traffic patterns for optimal signal timing')
      recommendations.push('Consider implementing adaptive signal control')
      recommendations.push('Maintain current signal timing with minor adjustments')
      break
    case 'light':
    default:
      recommendations.push('Current signal timing appears adequate for traffic volume')
      recommendations.push('Continue monitoring for traffic pattern changes')
      recommendations.push('Consider reducing green time during off-peak hours')
      break
  }
  
  return recommendations
} 