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
// Hàm kết nối SQL Server
// const connectToDatabase = () => {
//   return new Promise((resolve, reject) => {
//     const connection = new tedious.Connection(config);
//     connection.on('connect', (err) => {
//       if (err) {
//         console.error('Lỗi kết nối SQL Server:', err);
//         reject(err);
//       } else {
//         console.log('✅ Kết nối SQL Server thành công');
//         resolve(connection);
//       }
//     });
//     connection.on('error', reject);
//   });
// };

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


// **[GET] Lấy danh sách todos**
app.get('/api/todos', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const request = new tedious.Request("SELECT id, title, status FROM dbo.Luna1002", (err, rowCount, rows) => {
      if (err) {
        console.error('Lỗi truy vấn:', err);
        res.status(500).json({ error: 'Lỗi truy vấn dữ liệu' });
      } else {
        const data = rows.map(row => {
          const obj = {};
          row.forEach(column => obj[column.metadata.colName] = column.value);
          return obj;
        });
        res.json(data);
      }
      connection.close();
    });
    connection.execSql(request);
  } catch (error) {
    console.error("Lỗi kết nối hoặc truy vấn:", error);
    res.status(500).json({ error: 'Lỗi kết nối hoặc truy vấn' });
  }
});

// **[POST] Thêm một todo mới**
app.post('/api/todos', async (req, res) => {
  const { title, status } = req.body;
  try {
    const connection = await connectToDatabase();
    const request = new tedious.Request(
      `INSERT INTO dbo.Luna1002 (title, status) OUTPUT INSERTED.id VALUES (@title, @status)`,
      (err, rowCount, rows) => {
        if (err) {
          console.error('Lỗi tạo todo:', err);
          res.status(500).json({ error: 'Lỗi tạo todo' });
        } else {
          const id = rows[0][0].value;
          res.status(201).json({ id, message: 'Todo đã được tạo thành công' });
        }
        connection.close();
      }
    );
    request.addParameter('title', tedious.TYPES.NVarChar, title);
    request.addParameter('status', tedious.TYPES.NVarChar, status);
    connection.execSql(request);
  } catch (error) {
    console.error("Lỗi kết nối hoặc tạo todo:", error);
    res.status(500).json({ error: 'Lỗi kết nối hoặc tạo todo' });
  }
});

// **[PUT] Cập nhật todo**
app.put('/api/todos/:id', async (req, res) => {
  const { title, status } = req.body;
  const { id } = req.params;
  try {
    const connection = await connectToDatabase();
    const request = new tedious.Request(
      `UPDATE dbo.Luna1002 SET title = @title, status = @status WHERE id = @id`,
      (err, rowCount) => {
        if (err) {
          console.error('Lỗi cập nhật todo:', err);
          res.status(500).json({ error: 'Lỗi cập nhật todo' });
        } else {
          res.json({ message: 'Todo đã được cập nhật' });
        }
        connection.close();
      }
    );
    request.addParameter('title', tedious.TYPES.NVarChar, title);
    request.addParameter('status', tedious.TYPES.NVarChar, status);
    request.addParameter('id', tedious.TYPES.Int, id);
    connection.execSql(request);
  } catch (error) {
    console.error("Lỗi kết nối hoặc cập nhật todo:", error);
    res.status(500).json({ error: 'Lỗi kết nối hoặc cập nhật todo' });
  }
});

// **[DELETE] Xóa một todo**
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await connectToDatabase();
    const request = new tedious.Request(
      `DELETE FROM dbo.Luna1002 WHERE id = @id`,
      (err, rowCount) => {
        if (err) {
          console.error('Lỗi xóa todo:', err);
          res.status(500).json({ error: 'Lỗi xóa todo' });
        } else {
          res.json({ message: 'Todo đã được xóa' });
        }
        connection.close();
      }
    );
    request.addParameter('id', tedious.TYPES.Int, id);
    connection.execSql(request);
  } catch (error) {
    console.error("Lỗi kết nối hoặc xóa todo:", error);
    res.status(500).json({ error: 'Lỗi kết nối hoặc xóa todo' });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
});
