@echo off
echo Criando atalho na area de trabalho...

REM Cria atalho via PowerShell
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Crypto Facil.lnk');$s.TargetPath='D:\Programas html\Cripto\iniciar.bat';$s.WorkingDirectory='D:\Programas html\Cripto';$s.Description='Crypto Facil - Melhores Oportunidades';$s.Save()"

echo.
echo Atalho criado: "Crypto Facil" na area de trabalho!
echo.
pause
