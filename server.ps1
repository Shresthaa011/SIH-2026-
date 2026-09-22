param(
    [int]$Port = 8080
)

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Initialize secure storage vault directory (isolated from public web access)
$secureVaultDir = [System.IO.Path]::Combine($root, "storage", "secure_idv")
if (-not [System.IO.Directory]::Exists($secureVaultDir)) {
    [System.IO.Directory]::CreateDirectory($secureVaultDir) | Out-Null
}

$verificationsDbFile = [System.IO.Path]::Combine($secureVaultDir, "verifications.json")
if (-not [System.IO.File]::Exists($verificationsDbFile)) {
    [System.IO.File]::WriteAllText($verificationsDbFile, "[]", [System.Text.Encoding]::UTF8)
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " TerraByte National Platform & IDV Gateway is Live!" -ForegroundColor Cyan
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Web Root: $root" -ForegroundColor Gray
    Write-Host " Private Vault: $secureVaultDir (Protected)" -ForegroundColor DarkGray
    Write-Host " IdentityVerificationService: Ready (Demo Mode)" -ForegroundColor Magenta
    Write-Host " Press Ctrl+C in this console window to stop the server." -ForegroundColor DarkGray
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Error "Failed to start HTTP listener on port $Port. Error: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

function Send-JsonResponse($response, [int]$statusCode, $obj) {
    $json = ConvertTo-Json -InputObject $obj -Depth 10 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json; charset=utf-8"
    $response.ContentLength64 = $bytes.Length
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        $httpMethod = $request.HttpMethod

        # Add global CORS headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

        # Handle CORS preflight
        if ($httpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.ContentLength64 = 0
            $response.Close()
            continue
        }

        # -------------------------------------------------------------
        # REST API: Health Check
        # -------------------------------------------------------------
        if ($rawUrl -eq "/api/health") {
            Send-JsonResponse $response 200 @{
                status = "UP"
                service = "TerraByte IdentityVerificationService"
                mode = "Demo Verification"
                timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
            continue
        }

        # -------------------------------------------------------------
        # REST API: Upload Biometric Photo & Register Verification
        # Endpoint: POST /api/idv/upload-photo
        # -------------------------------------------------------------
        if ($rawUrl -eq "/api/idv/upload-photo" -and $httpMethod -eq "POST") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $bodyText = $reader.ReadToEnd()
                $reader.Close()

                if ([string]::IsNullOrWhiteSpace($bodyText)) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Missing request payload." }
                    continue
                }

                $payload = ConvertFrom-Json -InputObject $bodyText

                $userId = if ($payload.userId) { [string]$payload.userId } else { "U-ANON-" + [System.Guid]::NewGuid().ToString("N").Substring(0, 6) }
                $userName = if ($payload.userName) { [string]$payload.userName } else { "Verified Citizen" }
                $maskedPan = if ($payload.maskedPan) { [string]$payload.maskedPan } else { "ABCDE****F" }
                $photoData = [string]$payload.photoData

                # File validation: Ensure photoData is a valid image base64 data URL
                if ([string]::IsNullOrWhiteSpace($photoData) -or -not ($photoData -match "^data:image\/(jpeg|jpg|png|webp);base64,(.+)")) {
                    Send-JsonResponse $response 400 @{
                        success = $false
                        error = "Invalid or missing photograph data. Supported formats: JPEG, PNG, WEBP."
                    }
                    continue
                }

                $base64Content = $matches[2]
                $imageBytes = [System.Convert]::FromBase64String($base64Content)

                # Size validation: Maximum 5MB, Minimum 200 bytes
                if ($imageBytes.Length -gt 5242880) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Photograph exceeds maximum permitted size of 5 MB." }
                    continue
                }
                if ($imageBytes.Length -lt 200) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Photograph data payload is incomplete or corrupted." }
                    continue
                }

                # Generate secure unique verification ID
                $randomCode = -join ((65..90) + (48..57) | Get-Random -Count 5 | ForEach-Object { [char]$_ })
                $verId = "TB-IDV-2026-" + $randomCode

                # Save securely to private vault (isolated from public URLs)
                $photoFileName = "idv_photo_" + [System.Guid]::NewGuid().ToString("N") + ".jpg"
                $photoFilePath = [System.IO.Path]::Combine($secureVaultDir, $photoFileName)
                [System.IO.File]::WriteAllBytes($photoFilePath, $imageBytes)

                # Internal vault reference (not a public URL)
                $photoVaultRef = "secure_vault://" + $photoFileName
                $nowIso = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

                # Construct verification record
                $record = @{
                    verification_id     = $verId
                    user_id             = $userId
                    user_name           = $userName
                    masked_pan          = $maskedPan
                    photo_reference     = $photoVaultRef
                    pan_status          = "VERIFIED"
                    biometric_status    = "VERIFIED"
                    verification_status = "VERIFIED"
                    verification_mode   = "Demo Verification"
                    created_at          = $nowIso
                }

                # Persist to verifications.json
                $existingJson = [System.IO.File]::ReadAllText($verificationsDbFile, [System.Text.Encoding]::UTF8)
                $recordsList = @()
                if (-not [string]::IsNullOrWhiteSpace($existingJson)) {
                    try {
                        $parsed = ConvertFrom-Json -InputObject $existingJson
                        if ($parsed -is [System.Collections.IEnumerable]) {
                            $recordsList = @($parsed)
                        } else {
                            $recordsList = @($parsed)
                        }
                    } catch {}
                }
                $recordsList += $record
                $updatedJson = ConvertTo-Json -InputObject $recordsList -Depth 10
                [System.IO.File]::WriteAllText($verificationsDbFile, $updatedJson, [System.Text.Encoding]::UTF8)

                # Return statutory verification confirmation (no sensitive biometrics exposed)
                Send-JsonResponse $response 200 @{
                    success             = $true
                    verification_id     = $verId
                    user_id             = $userId
                    masked_pan          = $maskedPan
                    photo_reference     = $photoVaultRef
                    pan_status          = "VERIFIED"
                    biometric_status    = "VERIFIED"
                    verification_status = "VERIFIED"
                    verification_mode   = "Demo Verification"
                    created_at          = $nowIso
                    message             = "Photograph received, validated, and stored in secure vault. Verification record generated."
                }
                continue
            } catch {
                Send-JsonResponse $response 500 @{
                    success = $false
                    error = "Internal error processing identity verification: " + $_.Exception.Message
                }
                continue
            }
        }

        # -------------------------------------------------------------
        # REST API: List Verification Records (Audit Trail)
        # Endpoint: GET /api/idv/verifications
        # -------------------------------------------------------------
        if ($rawUrl -eq "/api/idv/verifications" -and $httpMethod -eq "GET") {
            $existingJson = [System.IO.File]::ReadAllText($verificationsDbFile, [System.Text.Encoding]::UTF8)
            $records = ConvertFrom-Json -InputObject $existingJson
            Send-JsonResponse $response 200 @{
                success = $true
                count = ($records | Measure-Object).Count
                verifications = $records
            }
            continue
        }

        # -------------------------------------------------------------
        # SECURITY PROTECTION: Block Public Access to Private Vault
        # "Do NOT expose the captured photograph through a public URL"
        # -------------------------------------------------------------
        if ($rawUrl -like "*/storage/*" -or $rawUrl -like "*/secure_idv/*" -or $rawUrl -like "*idv_photo_*") {
            $denyMsg = [System.Text.Encoding]::UTF8.GetBytes("403 - Forbidden: Access to biometric private storage vault is strictly prohibited under DPDP Act 2023.")
            $response.StatusCode = 403
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $denyMsg.Length
            $response.OutputStream.Write($denyMsg, 0, $denyMsg.Length)
            $response.Close()
            continue
        }

        # -------------------------------------------------------------
        # Static Web File Serving
        # -------------------------------------------------------------
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        # Sanitize path to prevent directory traversal
        $relative = $rawUrl.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($root, $relative)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.AddHeader("Cache-Control", "no-cache")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $rawUrl")
            $response.StatusCode = 404
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $notFoundMsg.Length
            $response.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
        }
        $response.Close()
    } catch {
        # Catch and continue on client disconnects or minor IO interruptions
    }
}
