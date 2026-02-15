#!/bin/bash

# Define the replacements with regex support for any level of relative paths
# Format: "search_regex" "replacement_string"
replacements=(
    "(\.\.\/)+(src/|libs/shared/)?application/" "application/"
    "(\.\.\/)+(src/|libs/shared/)?domain/" "domain/"
    "(\.\.\/)+(src/|libs/shared/)?data/" "data/"
    "(\.\.\/)+(src/|libs/shared/)?infrastructure/" "infrastructure/"
    "(\.\.\/)+(src/|libs/shared/)?presentation/" "ui/"
    "(\.\.\/)+(src/|libs/shared/)?components/" "ui/components/"
    "(\.\.\/)+(src/|libs/shared/)?hooks/" "ui/hooks/"
    "(\.\.\/)+(src/|libs/shared/)?constants/" "ui/constants/"
    "(\.\.\/)+(src/|libs/shared/)?stores/" "ui/stores/"
)

# Find all ts, tsx, js, jsx files
files=$(find ./libs ./apps -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

for file in $files; do
    if [ -f "$file" ]; then
        for ((i=0; i<${#replacements[@]}; i+=2)); do
            search="${replacements[i]}"
            replace="${replacements[i+1]}"
            # Use sed with extended regex to replace only after "from '" or "import '"
            # but for simplicity we use global replace since these are unlikely to be elsewhere
            sed -i -E "s|$search|$replace|g" "$file"
        done
    fi
done

# Cleanup double prefixes if any were introduced
find ./libs ./apps -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i -E "s|(ui\|infrastructure\|domain\|application\|data)/(ui\|infrastructure\|domain\|application\|data)/|\1/|g" {} +

echo "Final deep import migration complete."
