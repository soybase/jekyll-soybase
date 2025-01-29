import json

input_file = "observations-Glycine.json"
output_file = "observations_Glycine_filter.json"

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

filtered_data = []
for entry in data:
    filtered_entry = {
        "germplasmName": entry.get("germplasmName", ""),
        "observationVariableDbId": entry.get("observationVariableDbId", ""),
        "observationVariableName": entry.get("observationVariableName", ""),
        "value": entry.get("value", "")
    }          
    filtered_data.append(filtered_entry)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, indent=4)

print(f"Filtered data saved to {output_file}")