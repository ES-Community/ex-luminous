cd client
npm ci
npm run package-win
ls dist
Compress-Archive dist/ExLuminous-win32-x64 dist/ExLuminous-win32-x64.zip
