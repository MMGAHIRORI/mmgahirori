# PowerShell script to set up and test the temporary user account system
# Run this script from the project root directory

Write-Host "=== Mangal Project - Temporary User Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "1. Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "2. Building the project..." -ForegroundColor Yellow
npm run build:dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "3. Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "SETUP INSTRUCTIONS:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. First, run the database migration in your Supabase dashboard:"
Write-Host "   - Go to your Supabase project > SQL Editor"
Write-Host "   - Copy and run the SQL from: src/database/migrations/add_temp_user_fields.sql"
Write-Host ""
Write-Host "2. After the server starts, follow this flow:"
Write-Host "   a) Navigate to: http://localhost:8080/temp-setup"
Write-Host "   b) Create temporary account with:"
Write-Host "      Username: Sangam"
Write-Host "      Email: mmgahirori@gmail.com"
Write-Host "      Password: Admin@123"
Write-Host ""
Write-Host "   c) Login at: http://localhost:8080/temp-login"
Write-Host "      (Will redirect directly to /admin)"
Write-Host ""
Write-Host "   d) In the Admin Dashboard:"
Write-Host "      - You'll see ONLY the admin creation form"
Write-Host "      - Fill out the permanent admin details"
Write-Host "      - Submit to create the admin user"
Write-Host "      - Temporary account will auto-disable"
Write-Host ""
Write-Host "   e) Use admin credentials at: http://localhost:8080/admin-login"
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
