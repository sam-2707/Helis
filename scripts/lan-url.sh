#!/bin/bash
# Print the phone URL for Helis teacher mobile app
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [ -z "$IP" ]; then
  echo "Could not detect Wi-Fi IP. Check System Settings → Network → Wi-Fi."
  exit 1
fi
echo "Laptop IP:  $IP"
echo "Phone URL:  http://$IP:3000/teacher/mobile"
echo ""
echo "Make sure:"
echo "  1) npm run dev is running on this Mac"
echo "  2) Phone is on the SAME Wi-Fi (not mobile data)"
echo "  3) Use http:// not https://"
