#!/bin/bash
# Script to test rate limiting by making rapid successive requests

echo "Testing Rate Limiting on GET /api/endpoints"
echo "=============================================="
echo ""

for i in {1..15}
do
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nRATE_LIMIT:%{header_json}" http://localhost:3001/api/endpoints 2>&1)
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d':' -f2)
    
    if [ "$http_code" = "429" ]; then
        echo "Request $i: ❌ Rate Limited (HTTP 429)"
    else
        echo "Request $i: ✅ Success (HTTP $http_code)"
    fi
    
    # Small delay to ensure requests are processed
    sleep 0.1
done

echo ""
echo "Rate limiting test completed!"
