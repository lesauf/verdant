#!/bin/bash

# Define the replacements with regex support for relative paths
# Format: "search_regex" "replacement_string"
replacements=(
    "(\.\.\/)*src/application/" "application/"
    "(\.\.\/)*src/domain/" "domain/"
    "(\.\.\/)*src/data/" "data/"
    "(\.\.\/)*src/infrastructure/" "infrastructure/"
    "(\.\.\/)*src/presentation/" "ui/"
    "(\.\.\/)*src/lib/" "infrastructure/lib/" # Might need care
    "(\.\.\/)*components/" "ui/components/"
    "(\.\.\/)*hooks/" "ui/hooks/"
    "(\.\.\/)*constants/" "ui/constants/"
    "(\.\.\/)*stores/" "ui/stores/"
    "@/src/application/" "application/"
    "@/src/domain/" "domain/"
    "@/src/data/" "data/"
    "@/src/infrastructure/" "infrastructure/"
    "@/src/presentation/" "ui/"
)

# Find all ts, tsx, js, jsx files
files=$(find ./libs ./apps -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

for file in $files; do
    if [ -f "$file" ]; then
        for ((i=0; i<${#replacements[@]}; i+=2)); do
            search="${replacements[i]}"
            replace="${replacements[i+1]}"
            # Use sed with extended regex
            sed -i -E "s|$search|$replace|g" "$file"
        done
    fi
done

echo "Deep import migration complete."
