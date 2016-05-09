@echo off
set nwcd=C:\Program Files (x86)\nwjs-v0.12.3-win-ia32
set buildcd=%CD%\platforms\nw\win32
set browserplatform=%CD%\platforms\browser\www
rem Build: %buildcd%
rem Platform: %buildcd%
rem NW: %buildcd%
copy %CD%\package.json %browserplatform%
7z.exe a -tzip %buildcd%\com.nw %browserplatform%\* -mx0 & rem zip files
del %browserplatform%\package.json
copy "%nwcd%\nw.pak" %buildcd%\nw.pak
copy "%nwcd%\*.dll" %buildcd%\
rem icudtl.dat from current nw
copy "%nwcd%\icudtl.dat" %buildcd%\icudtl.dat
rem compilation to executable form
copy /b "%nwcd%\nw.exe"+%buildcd%\com.nw %buildcd%\corsa.exe
del %buildcd%\com.nw
rem build done
