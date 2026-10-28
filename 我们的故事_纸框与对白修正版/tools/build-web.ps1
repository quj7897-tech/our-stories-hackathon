param([Parameter(Mandatory=$true)][string]$Editor,[Parameter(Mandatory=$true)][string]$WebTemplate)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$engineProject=Join-Path $projectRoot 'godot'
$scratch=Join-Path $projectRoot '.tools'
New-Item -ItemType Directory -Force -Path "$scratch\profile","$scratch\temp" | Out-Null
$env:APPDATA="$scratch\profile"; $env:LOCALAPPDATA="$scratch\profile"
$env:TEMP="$scratch\temp"; $env:TMP="$scratch\temp"
$preset=Join-Path $engineProject 'export_presets.cfg'
$saved=[IO.File]::ReadAllText($preset)
try {
  $templatePath=(Resolve-Path -LiteralPath $WebTemplate).Path.Replace('\','/')
  [IO.File]::WriteAllText($preset,$saved.Replace('custom_template/release=""','custom_template/release="'+$templatePath+'"'))
  & $Editor --headless --path $engineProject --editor --import --log-file "$scratch\import.log"
  if($LASTEXITCODE -ne 0){throw 'Godot import failed'}
  & $Editor --headless --path $engineProject --export-release Web --log-file "$scratch\export.log"
  if($LASTEXITCODE -ne 0){throw 'Godot export failed'}
  & node (Join-Path $engineProject 'compress-web.cjs')
  if($LASTEXITCODE -ne 0){throw 'Engine compression failed'}
} finally { [IO.File]::WriteAllText($preset,$saved) }
