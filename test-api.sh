#!/bin/bash

# Test the learners/:id endpoint
LEARNER_ID="cf1ad46d-98ff-4a69-a958-f3cb0cfd8675"
API_URL="http://localhost:5000/api/learners/$LEARNER_ID"

echo "Testing GET $API_URL"
echo "========================================"
curl -s "$API_URL" | jq '.'
