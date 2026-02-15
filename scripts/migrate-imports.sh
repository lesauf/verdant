#!/bin/bash

# Define the replacements
# Format: "search_pattern" "replacement_string"
replacements=(
    "@/src/application/" "application/"
    "@/src/domain/" "domain/"
    "@/src/data/" "data/"
    "@/src/infrastructure/" "infrastructure/"
    "@/src/presentation/" "ui/"
    "@/src/presentation/components/" "ui/components/"
    "@/src/presentation/hooks/" "ui/hooks/"
    "@/src/presentation/constants/" "ui/constants/"
    "@/components/" "ui/components/"
    "@/hooks/" "ui/hooks/"
    "@/constants/" "ui/constants/"
    "@/app/" "../app/"  # Within apps/mobile/app, might need adjustment
)

# Function to escape forward slashes for sed
escape() {
    echo "$1" | sed 's/\//\\\//g'
}

# Find all ts, tsx, js, jsx files
files=$(find . -path "./libs" -prune -o -path "./apps" -prune -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -print)
# Also include files inside libs and apps
files="$files $(find ./libs ./apps -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")"

for file in $files; do
    if [ -f "$file" ]; then
        for ((i=0; i<${#replacements[@]}; i+=2)); do
            search=$(escape "${replacements[i]}")
            replace=$(escape "${replacements[i+1]}")
            sed -i "s/$search/$replace/g" "$file"
        done
    fi
done

echo "Import migration complete."
