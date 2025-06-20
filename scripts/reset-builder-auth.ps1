# reset-builder-auth.ps1

Write-Host 'Logging out of Builder.io CLI...'
npx "@builder.io/cli" logout

Write-Host 'Logging in to Builder.io CLI...'
npx "@builder.io/cli" login