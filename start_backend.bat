@echo off
echo Starting Typhoon AI Backend...
cd C:\Users\Win11\Desktop\Typhoon
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause

python -m http.server 7890 --directory "C:\Users\Win11\Desktop\Typhoon\frontend"