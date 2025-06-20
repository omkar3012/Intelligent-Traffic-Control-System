import cv2
import sys
import random
import time
from datetime import datetime

def processVideo(video_path):
    """Simplified vehicle detection that provides mock results"""
    # print(f"Processing video: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        # print("Error: Could not open video file.")
        return
    
    # Get video properties
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    
    # print(f"Video properties: {total_frames} frames, {fps:.2f} fps, {duration:.2f} seconds")
    
    # Simulate processing
    vehicle_count_total = 0
    frame_count = 0
    
    # Process every 30th frame to speed up
    sample_interval = 30
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Only process every 30th frame
        if frame_count % sample_interval == 0:
            # Simulate vehicle detection
            vehicles_in_frame = random.randint(0, 8)  # 0-8 vehicles per frame
            vehicle_count_total += vehicles_in_frame
            
            # # Simulate signal timing calculation
            # base_green = 20
            # green_increment = min(vehicles_in_frame * 2, 40)
            # green_time = base_green + green_increment
            
            # print(f"Frame {frame_count}: {vehicles_in_frame} vehicles detected")
            # print(f"Signal timing: Green - {green_time}s, Yellow - 3s")
    
    cap.release()
    
    # Calculate final statistics
    processed_frames = frame_count // sample_interval
    average_vehicles = vehicle_count_total / max(processed_frames, 1)
    
    # print(f"Processing complete!")
    print(f"Total vehicles detected: {vehicle_count_total}")
    # print(f"Average vehicles per frame: {average_vehicles:.2f}")
    # print(f"Processed {processed_frames} frames out of {total_frames} total frames")
    
    return {
        'total_vehicles': vehicle_count_total,
        'average_vehicles': average_vehicles,
        'processed_frames': processed_frames,
        'total_frames': total_frames
    }

if __name__ == "__main__":
    # Get video path from command line argument or use default
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
    else:
        video_path = './traffic.mp4'
    
    result = processVideo(video_path) 