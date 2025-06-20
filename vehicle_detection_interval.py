import tensorflow_compat  # Import compatibility layer first
import cv2
from darkflow.net.build import TFNet
import os
import math
import time
import sys

class TrafficSignal:
    def __init__(self, lanes_per_direction):
        self.lanes_per_direction = lanes_per_direction
        self.max_green_time = 60
        self.green_time = [30] * lanes_per_direction
        self.yellow_time = [3] * lanes_per_direction

    def update_signal_timings(self, vehicle_counts):
        for lane in range(self.lanes_per_direction):
            green_time = self.calculate_green_time(vehicle_counts[lane])
            self.green_time[lane] = min(self.max_green_time, green_time)
            self.yellow_time[lane] = min(5, self.green_time[lane] // 10)

    def calculate_green_time(self, num_cars):
        base_time = 10
        weight_factor = 0.01
        max_weighted_time = 60
        weighted_time = base_time + (max_weighted_time - base_time) * (1 - math.exp(-weight_factor * num_cars))
        return weighted_time

    def print_signal_timings(self):
        print("Signal Timings:")
        for lane in range(self.lanes_per_direction):
            print(f"Lane {lane + 1}: Green - {self.green_time[lane]} sec, Yellow - {self.yellow_time[lane]} sec")


options = {
    'model': './cfg/yolo.cfg',
    'load': './bin/yolov2.weights',
    'threshold': 0.3
}
lanes_per_direction = 1
signal = TrafficSignal(lanes_per_direction)

tfnet = TFNet(options)

def detectVehicles(frame):
    global tfnet, signal
    
    result = tfnet.return_predict(frame)
    
    vehicle_count = 0
    for vehicle in result:
        label = vehicle['label']
        if label in ["car", "bus", "bike", "truck", "rickshaw"]:
            vehicle_count += 1
    
    vehicle_counts =[vehicle_count, vehicle_count, vehicle_count, vehicle_count]
    signal.update_signal_timings(vehicle_counts)
    signal.print_signal_timings()
    
    for vehicle in result:
        label = vehicle['label']
        if label in ["car", "bus", "bike", "truck", "rickshaw"]:
            top_left = (vehicle['topleft']['x'], vehicle['topleft']['y'])
            bottom_right = (vehicle['bottomright']['x'], vehicle['bottomright']['y'])
            frame = cv2.rectangle(frame, top_left, bottom_right, (0, 255, 0), 3)
            frame = cv2.putText(frame, label, top_left, cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 0, 0), 1)
    
    return frame

def processVideo(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video file.")
        return
    
    vehicle_count_total = 0
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        result = tfnet.return_predict(frame)
        
        vehicle_count = 0
        for vehicle in result:
            label = vehicle['label']
            if label in ["car", "bus", "bike", "truck", "rickshaw"]:
                vehicle_count += 1
        
        vehicle_count_total += vehicle_count
        
        if frame_count % int(3 * cap.get(cv2.CAP_PROP_FPS)) == 0:
            vehicle_counts = [vehicle_count, vehicle_count, vehicle_count, vehicle_count]
            signal.update_signal_timings(vehicle_counts)
            signal.print_signal_timings()
    
    cap.release()
    
    # Print final results
    print(f"Total vehicles detected: {vehicle_count_total}")
    print(f"Average vehicles per frame: {vehicle_count_total / max(frame_count, 1):.2f}")

# Get video path from command line argument or use default
if len(sys.argv) > 1:
    video_path = sys.argv[1]
else:
    video_path = './traffic.mp4'

print(f"Processing video: {video_path}")
processVideo(video_path)
