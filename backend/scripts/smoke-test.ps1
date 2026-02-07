$ErrorActionPreference = 'Stop'

$base = "http://localhost:4000"

function Step($name) {
  Write-Host ("==> {0}" -f $name)
}

try {
  Step "login"
  $loginBody = @{ email = "admin@demo.com"; password = "Admin@1234" } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $loginBody
  $headers = @{ Authorization = "Bearer $($login.data.token)" }

  Step "me"
  $me = Invoke-RestMethod -Method Get -Uri "$base/api/auth/me" -Headers $headers

  Step "products"
  $products = Invoke-RestMethod -Method Get -Uri "$base/api/products" -Headers $headers

  Step "plans"
  $plans = Invoke-RestMethod -Method Get -Uri "$base/api/plans" -Headers $headers

  if (-not $products.data -or $products.data.Count -lt 1) { throw "No products found" }
  if (-not $plans.data -or $plans.data.Count -lt 1) { throw "No plans found" }

  $productId = $products.data[0].id
  $planId = $plans.data[0].id

  Step "create subscription"
  $subBody = @{ customerId = $me.data.id; planId = $planId; startDate = (Get-Date).ToString('o'); lines = @(@{ productId = $productId; quantity = 1 }) } | ConvertTo-Json -Depth 6
  $sub = Invoke-RestMethod -Method Post -Uri "$base/api/subscriptions" -Headers $headers -ContentType "application/json" -Body $subBody

  Step "generate invoice"
  $invBody = @{ subscriptionId = $sub.data.id } | ConvertTo-Json
  $inv = Invoke-RestMethod -Method Post -Uri "$base/api/invoices/generate" -Headers $headers -ContentType "application/json" -Body $invBody

  Step "pay invoice"
  $amt = [decimal]$inv.data.totalAmount
  $payBody = @{ invoiceId = $inv.data.id; amount = $amt; method = "CARD"; reference = "dry-run" } | ConvertTo-Json
  $pay = Invoke-RestMethod -Method Post -Uri "$base/api/payments" -Headers $headers -ContentType "application/json" -Body $payBody

  Step "fetch invoice"
  $invoice = Invoke-RestMethod -Method Get -Uri "$base/api/invoices/$($inv.data.id)" -Headers $headers

  [PSCustomObject]@{
    ok = $true
    admin = $me.data.email
    productCount = ($products.data | Measure-Object).Count
    planCount = ($plans.data | Measure-Object).Count
    subscriptionNo = $sub.data.subscriptionNo
    invoiceNo = $inv.data.invoiceNo
    invoiceStatus = $invoice.data.status
    totalAmount = $invoice.data.totalAmount
    paymentId = $pay.data.payment.id
  } | ConvertTo-Json -Depth 6
}
catch {
  Write-Host "FAILED" -ForegroundColor Red
  $_ | Format-List * -Force
  exit 1
}
