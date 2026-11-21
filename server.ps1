# ==============================================================================
# Lover's Lily Mirror - Lightweight Local Web Server (TcpListener)
# Zero dependencies, no admin rights required, pure PowerShell & .NET Sockets
# ==============================================================================

$Port = 3000
$BaseDir = $PSScriptRoot
if (-not $BaseDir) { $BaseDir = (Get-Location).Path }

# Find available port
$listener = $null
$bound = $false
while (-not $bound -and $Port -lt 3050) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $bound = $true
    } catch {
        $Port++
    }
}

if (-not $bound) {
    Write-Error "Could not bind to any port between 3000 and 3050."
    exit 1
}

$url = "http://localhost:$Port/"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "  🌸 LOVER'S LILY MIRROR IS LIVE! 🌸" -ForegroundColor Yellow
Write-Host "  Local URL: $url" -ForegroundColor Cyan
Write-Host "  Directory: $BaseDir" -ForegroundColor Gray
Write-Host "  Press Ctrl+C in this console to stop the server." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host ""

# Open default browser
try {
    Start-Process $url
} catch {
    Write-Host "Please open $url in your web browser." -ForegroundColor Yellow
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wasm" = "application/wasm"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($requestLine)) {
            $client.Close()
            continue
        }

        # Read remaining headers
        while ($line = $reader.ReadLine()) {
            if ($line.Trim() -eq "") { break }
        }

        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $rawPath = $parts[1].Split("?")[0]
        $rawPath = [System.Uri]::UnescapeDataString($rawPath)
        if ($rawPath -eq "/" -or [string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "/index.html"
        }

        $localRel = $rawPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($BaseDir, $localRel)
        $fullPath = [System.IO.Path]::GetFullPath($filePath)
        $fullBase = [System.IO.Path]::GetFullPath($BaseDir)

        if ($fullPath.StartsWith($fullBase, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path $fullPath -PathType Leaf)) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = $MimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $header = "HTTP/1.1 200 OK`r`n" +
                      "Content-Type: $mime`r`n" +
                      "Content-Length: $($bytes.Length)`r`n" +
                      "Access-Control-Allow-Origin: *`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`n" +
                      "Content-Type: text/plain`r`n" +
                      "Content-Length: $($notFound.Length)`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($notFound, 0, $notFound.Length)
        }

        $stream.Flush()
        $client.Close()
    }
} finally {
    if ($listener) {
        $listener.Stop()
    }
}
