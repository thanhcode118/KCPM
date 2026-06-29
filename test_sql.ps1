$conn = New-Object System.Data.SqlClient.SqlConnection('Server=localhost,1433;Database=master;User Id=sa;Password=BeeShop@2026!;TrustServerCertificate=True;');
try {
    $conn.Open();
    Write-Host 'Connected successfully to localhost!';
    $conn.Close();
} catch {
    Write-Host "Localhost error: $_";
}

$conn2 = New-Object System.Data.SqlClient.SqlConnection('Server=127.0.0.1,1433;Database=master;User Id=sa;Password=BeeShop@2026!;TrustServerCertificate=True;');
try {
    $conn2.Open();
    Write-Host 'Connected successfully to 127.0.0.1!';
    $conn2.Close();
} catch {
    Write-Host "127.0.0.1 error: $_";
}
