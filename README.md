# AI-Based Recruitment Screening and Employee Advisory System

## สิ่งที่ต้องติดตั้งก่อนเริ่ม

* [Docker](https://www.docker.com/)
* [Go](https://go.dev/doc/install)
* [Node.js](https://nodejs.org/en/download)

---

## ขั้นตอนการใช้งาน

### 1. เริ่มเชื่อมต่อฐานข้อมูลโดย PostgreSQL ต่อเข้ากับ Docker Compose

```
docker compose up -d
```

> การตั้งค่า database อยู่ใน `.env` file

สร้าง `.env` ใน folder `backend/` และใส่ค่าดังนี้:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=hr_system
JWT_SECRET=mysecretkey123
DEEPSEEK_API_KEY=
LLAMA_API_KEY=
TYPHOON_API_KEY=
```

### 2. การใช้งาน Backend

```
cd backend
go run main.go
```

Backend จะ run ที่ `http://localhost:8080`

### 3. Run Frontend

```
cd frontend
npm install
npm run dev
```

Frontend จะ run ที่ `http://localhost:5173`

---

## วิธีลบข้อมูล

1. ทำการหยุดและลบ containers:

```
docker compose down
```

2. ลบ volume ทิ้ง:

```
docker compose down -v
```

---

## การเชื่อมต่อ Database ใน VS Code

ติดตั้ง Extension **PostgreSQL** (Chris Kolkman) แล้วใช้ค่าดังนี้:

| ช่อง | ค่าที่ใส่ |
|------|---------|
| Host | 127.0.0.1 |
| PostgreSQL user | postgres |
| Password | postgres123 |
| Port | 5432 |
| Use SSL? | Standard Connection |
| Database | hr_system |

---

## Tech Stack

* **Backend:** Go + Gin + GORM
* **Frontend:** React + TypeScript + Vite
* **Database:** PostgreSQL 15
* **Container:** Docker
* **AI:** DeepSeek OCR · Meta Llama 3 · Typhoon 2
