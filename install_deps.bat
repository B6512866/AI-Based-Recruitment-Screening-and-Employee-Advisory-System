@echo off
echo Installing Typhoon AI Platform dependencies...
"C:\Users\Win11\Desktop\Typhoon\backend\.venv\Scripts\pip.exe" install fastapi "uvicorn[standard]" python-multipart Pillow torch transformers accelerate sentencepiece protobuf pydantic python-dotenv
echo.
echo Done! Run start_backend.bat to start the server.
pause

