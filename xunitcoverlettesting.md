C:\Users\LENOVO\Downloads\GIT\KCPM>dotnet test HomeDecorShop/HomeDecorShop.Tests/HomeDecorShop.Tests.csproj --filter "FullyQualifiedName!~Withdraw_ValidAmount_DecreasesWalletBalance&FullyQualifiedName!~Withdraw_AmountGreaterThanBalance_ThrowsConflictException&FullyQualifiedName!~Create_WithValidInput_ShouldCreateAndReturnProductView&FullyQualifiedName!~Create_WithOriginalPriceLessThanCurrentPrice_ShouldThrowRequestValidationException" /p:CollectCoverage=true -tl:false
  Determining projects to restore...
  All projects are up-to-date for restore.
  HomeDecorShop.Domain -> C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Domain\bin\Debug\net9.0\HomeDe
  corShop.Domain.dll
  HomeDecorShop.Application -> C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Application\bin\Debug\net
  9.0\HomeDecorShop.Application.dll
  HomeDecorShop.Infrastructure -> C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Infrastructure\bin\Deb
  ug\net9.0\HomeDecorShop.Infrastructure.dll
  HomeDecorShop.API -> C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.API\bin\Debug\net9.0\HomeDecorSho
  p.API.dll
  HomeDecorShop.Tests -> C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Tests\bin\Debug\net9.0\HomeDeco
  rShop.Tests.dll
  [coverlet] _mapping file name: 'CoverletSourceRootsMapping_HomeDecorShop.Tests'
Test run for C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Tests\bin\Debug\net9.0\HomeDecorShop.Tests.dll (.NETCoreApp,Version=v9.0)
VSTest version 17.14.1 (x64)

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   236, Skipped:     0, Total:   236, Duration: 12 s - HomeDecorShop.Tests.dll (net9.0)
  [coverlet]
  Calculating coverage result...
   Generating report 'C:\Users\LENOVO\Downloads\GIT\KCPM\HomeDecorShop\HomeDecorShop.Tests\coverage.json'

+------------------------------+--------+--------+--------+
| Module                       | Line   | Branch | Method |
+------------------------------+--------+--------+--------+
| HomeDecorShop.API            | 62.78% | 31.57% | 79.62% |
+------------------------------+--------+--------+--------+
| HomeDecorShop.Application    | 67.48% | 62.5%  | 64.22% |
+------------------------------+--------+--------+--------+
| HomeDecorShop.Domain         | 88.82% | 100%   | 88.82% |
+------------------------------+--------+--------+--------+
| HomeDecorShop.Infrastructure | 2.51%  | 0%     | 5.14%  |
+------------------------------+--------+--------+--------+

+---------+--------+--------+--------+
|         | Line   | Branch | Method |
+---------+--------+--------+--------+
| Total   | 25.61% | 47.77% | 63.92% |
+---------+--------+--------+--------+
| Average | 55.39% | 48.51% | 59.45% |
+---------+--------+--------+--------+


Workload updates are available. Run `dotnet workload list` for more information.