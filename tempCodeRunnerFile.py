cted in {filename}: {vehicle_count}')
   # print('Output image stored at:', outputFilename)

for filename in os.listdir(inputPath):
   if filename.lower().endswith((".png", ".jpg", ".jpeg")):
      detectVehicles(filename)