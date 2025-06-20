import cv2
from darkflow.net.build import  TFNet
import os
import pandas as pd
import math
from datetime import datetime

def get_base_time_from_excel():
    # Read the Excel file
    df = pd.read_excel('predicted_traffic.csv')
    
    # Get the current date and time
    current_datetime = datetime.now()
    
    # Get the current hour (last whole hour)
    current_hour = current_datetime.replace(minute=0, second=0, microsecond=0)
    
    # Find the row in the DataFrame corresponding to the current hour
    row = df[df['DateTime'] == current_hour]
    
    # Extract the base time from the row
    base_time = row['Vehicles'].values[0] if not row.empty else 10  # Default base time is 10 if not found in the Excel
    
    return base_time

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
        # base_time = 10
        base_time = get_base_time_from_excel()
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
inputPath = os.getcwd() + "/test_images/"
outputPath = os.getcwd() + "/output_images/"



def detectVehicles(filename):
    global tfnet, inputPath, outputPath
    img = cv2.imread(inputPath + filename, cv2.IMREAD_COLOR)
    result = tfnet.return_predict(img)
   
    vehicle_count = 0  # Initialize a counter for the number of vehicles
    #write a code to printe the detection accuracy or score
    # print(result)
    # print(result[0]['confidence'])
    # print(result[0]['label']) 
    for vehicle in result:
        label = vehicle['label']
        if label in ["car", "bus", "bike", "truck", "rickshaw"]:
            top_left = (vehicle['topleft']['x'], vehicle['topleft']['y'])
            bottom_right = (vehicle['bottomright']['x'], vehicle['bottomright']['y'])
            img = cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 3)
            img = cv2.putText(img, label, top_left, cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 0, 0), 1)
            vehicle_count += 1  # Increment the counter for each detected vehicle

    vehicle_counts =[vehicle_count, vehicle_count, vehicle_count, vehicle_count]
    signal.update_signal_timings(vehicle_counts)
    signal.print_signal_timings()

    outputFilename = outputPath + "output_" + filename
    cv2.imwrite(outputFilename, img) 
    print(f'Number of vehicles detected in {filename}: {vehicle_count}')
   # print('Output image stored at:', outputFilename)

for filename in os.listdir(inputPath):
   if filename.lower().endswith((".png", ".jpg", ".jpeg")):
      detectVehicles(filename)

print("Done!")


