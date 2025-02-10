// const express = require('express');
// const tedious = require('tedious');
// const cors = require('cors');
const express = require('express');
const sql = require('mssql');  // Thay vì 'tedious'
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// const config = {
//   server: 'IT-0489\\MSSQLSERVER01',  // Hoặc địa chỉ IP nếu cần
//   database: 'Luna1002',
//   trustServerCertificate: true, // Tùy chọn SSL, có thể bỏ qua nếu không cần
// };
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // Đặt thành true nếu dùng Azure
    trustServerCertificate: true,
  },
};


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database Connection Failed!", err);
    process.exit(1);
  });
module.exports = { sql, poolPromise };


app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.get('/api/data', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Luna1002");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Lỗi truy vấn dữ liệu: ' + err.message);
  }
});

app.get('/api/todos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, title, status FROM dbo.Luna1002");
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).send('Lỗi truy vấn dữ liệu: ' + err.message);
  }
});

app.post('/api/todos', async (req, res) => {
  const { title, status } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('status', sql.Int, status) // status nên là kiểu Int nếu chỉ có 0 hoặc 1
      .query("INSERT INTO dbo.Luna1002 (title, status) OUTPUT INSERTED.id VALUES (@title, @status)");

    res.status(201).json({ id: result.recordset[0].id, message: 'Todo đã được tạo thành công' });
  } catch (err) {
    console.error("Lỗi khi thêm todo:", err);
    res.status(500).json({ error: 'Lỗi khi thêm todo: ' + err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query("UPDATE dbo.Luna1002 SET status = 1 WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Todo không tồn tại" });
    }

    res.json({ message: "Todo đã được cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật todo:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật todo: " + err.message });
  }
});


// Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
});
