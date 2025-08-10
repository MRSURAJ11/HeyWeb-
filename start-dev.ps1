# HeyWeb! Development Startup Script
# This script starts both the frontend and backend servers

Write-Host "Starting HeyWeb! Development Environment..." -ForegroundColor Green

# Check if .env file exists in server directory
$envFile = "server\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Warning: server\.env file not found!" -ForegroundColor Yellow
    Write-Host "Please create server\.env file with your OpenAI API key:" -ForegroundColor Cyan
    Write-Host "   OPENAI_API_KEY=your-actual-api-key-here" -ForegroundColor White
    Write-Host "   OPENAI_MODEL=gpt-4o-mini" -ForegroundColor White
    Write-Host "   PORT=4000" -ForegroundColor White
    Write-Host "   NODE_ENV=development" -ForegroundColor White
    Write-Host "   FRONTEND_ORIGIN=http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "You can copy from server\env.template and replace with your actual API key" -ForegroundColor Cyan
    Write-Host ""
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend will be available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use voice features, make sure to:" -ForegroundColor Yellow
Write-Host "   1. Allow microphone access when prompted" -ForegroundColor White
Write-Host "   2. Use a modern browser (Chrome, Firefox, Edge)" -ForegroundColor White
Write-Host "   3. Have your OpenAI API key configured in server\.env" -ForegroundColor White
Write-Host ""
Write-Host "If you encounter issues:" -ForegroundColor Yellow
Write-Host "   - Check browser console for errors" -ForegroundColor White
Write-Host "   - Ensure both servers are running" -ForegroundColor White
Write-Host "   - Verify your OpenAI API key is valid" -ForegroundColor White
