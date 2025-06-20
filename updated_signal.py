import random
import math
import time

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

def vehicle_detection():
    # vehicle_counts = [random.randint(0, 50) for _ in range(4)]
    vehicle_counts = [7, 7, 7, 7]   
    print(vehicle_counts)
    return vehicle_counts

def main():
    lanes_per_direction = 1
    signal = TrafficSignal(lanes_per_direction)

    while True:
        vehicle_counts = vehicle_detection()
        signal.update_signal_timings(vehicle_counts)
        signal.print_signal_timings()
        time.sleep(10)

if __name__ == "__main__":
    main()
