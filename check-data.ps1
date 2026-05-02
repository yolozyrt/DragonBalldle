$envFile = '.env'
$url = (Get-Content $envFile | Where-Object { $_ -like 'VITE_SUPABASE_URL=*' } | ForEach-Object { $_.Split('=',2)[1].Trim() })
$key = (Get-Content $envFile | Where-Object { $_ -like 'VITE_SUPABASE_ANON_KEY=*' } | ForEach-Object { $_.Split('=',2)[1].Trim() })

$endpoint = "$url/rest/v1/characters?select=name,image,serie_premiere_apparition,episode_premiere_apparition&image=not.is.null&limit=5"

$resp = Invoke-WebRequest -Uri $endpoint -Headers @{ apikey = $key; Authorization = "Bearer $key" } -Method Get -UseBasicParsing
$resp.Content | ConvertFrom-Json | ConvertTo-Json
