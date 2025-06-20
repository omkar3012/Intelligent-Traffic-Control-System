true_positives = 46
false_positives = 3
false_negatives = 1

accuracy = true_positives / (true_positives + false_positives + false_negatives)

print(f"Accuracy: {accuracy * 100:.2f}%")
