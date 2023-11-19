const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Add this line
const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

// 设置Multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadsFolder = path.join(__dirname, 'uploads');

// 确保 uploads 文件夹存在
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

app.post('/upload', upload.single('examAnswers'), (req, res) => {
  const fileName = req.body.fileName || 'default_exam';
  const fileContent = req.file.buffer.toString('utf-8');

  // 将文件保存到 uploads 文件夹中
  const filePath = path.join(uploadsFolder, fileName);
  fs.writeFileSync(filePath, fileContent);

  console.log(`文件保存成功: ${filePath}`);

  res.status(200).send('文件上传成功！');
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
