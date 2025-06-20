import random
import time

class TrafficSignal:
    def __init__(self, lanes_per_direction):
        self.lanes_per_direction = lanes_per_direction
        self.directions = 4  # North, South, East, West
        self.green_time = [[30] * lanes_per_direction for _ in range(self.directions)]
        self.red_time = [[30] * lanes_per_direction for _ in range(self.directions)]
        self.yellow_time = [[3] * lanes_per_direction for _ in range(self.directions)]
        
    def update_signal_timings(self, vehicle_counts, pedestrian_counts, avg_speeds):
        # Adjust signal timings based on vehicle counts, pedestrian counts, and average speeds for all directions
        for direction in range(self.directions):
            for lane in range(self.lanes_per_direction):
                if vehicle_counts[direction][lane] > 20 or pedestrian_counts[direction][lane] > 10:
                    # Increase green time if vehicle count or pedestrian count is high
                    self.green_time[direction][lane] += 5
                    self.red_time[direction][lane] -= 5
                elif vehicle_counts[direction][lane] < 10 and pedestrian_counts[direction][lane] < 5:
                    # Decrease green time if vehicle count and pedestrian count are low
                    self.green_time[direction][lane] -= 5
                    self.red_time[direction][lane] += 5
                if avg_speeds[direction][lane] < 20:
                    # Increase green time if average speed is low
                    self.green_time[direction][lane] += 5
                    self.red_time[direction][lane] -= 5
                elif avg_speeds[direction][lane] > 30:
                    # Decrease green time if average speed is high
                    self.green_time[direction][lane] -= 5
                    self.red_time[direction][lane] += 5
                # Ensure green time stays within reasonable bounds
                self.green_time[direction][lane] = max(10, min(60, self.green_time[direction][lane]))
                # Calculate yellow time based on green time
                self.yellow_time[direction][lane] = min(5, self.green_time[direction][lane] // 10)
            
    def print_signal_timings(self):
        print("Signal Timings:")
        directions = ["North", "South", "East", "West"]
        for direction in range(self.directions):
            for lane in range(self.lanes_per_direction):
                print(f"{directions[direction]} Lane {lane + 1}: Green - {self.green_time[direction][lane]} sec, Red - {self.red_time[direction][lane]} sec, Yellow - {self.yellow_time[direction][lane]} sec")

def vehicle_detection():
    # Simulate vehicle and pedestrian detection and counts for all directions and lanes
    vehicle_counts = [[random.randint(0, 50) for _ in range(4)] for _ in range(4)]
    pedestrian_counts = [[random.randint(0, 20) for _ in range(4)] for _ in range(4)]
    return vehicle_counts, pedestrian_counts

def average_speed():
    # Simulate average speed measurement for all directions and lanes
    return [[random.randint(10, 50) for _ in range(4)] for _ in range(4)]

def main():
    lanes_per_direction = 4
    signal = TrafficSignal(lanes_per_direction)

    while True:
        # Simulate vehicle and pedestrian detection and average speed measurement
        vehicle_counts, pedestrian_counts = vehicle_detection()
        avg_speeds = average_speed()

        # Update signal timings based on vehicle counts, pedestrian counts, and speed
        signal.update_signal_timings(vehicle_counts, pedestrian_counts, avg_speeds)

        # Print the updated signal timings
        signal.print_signal_timings()

        # Sleep to simulate a time interval (adjust as needed)
        time.sleep(10)

if __name__ == "__main__":
    main()
