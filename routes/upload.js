// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 1. Multer 설정 (파일 저장소 설정)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 'uploads' 폴더에 저장해라
    },
    filename: function (req, file, cb) {
        // 취약점: 사용자가 보낸 파일명(originalname)을 그대로 사용함
        // 해커가 "hack.html"로 보내면 그대로 저장되어 실행 가능해짐
        cb(null, file.originalname);
    }
});

// 필터링 없는 업로드 객체 생성
const upload = multer({ storage: storage });

// 2. 업로드 페이지 보여주기 (GET)
router.get('/', (req, res) => {
    res.render('upload');
});

// 3. 파일 업로드 처리 (POST)
// 'file'은 HTML form의 input name과 같아야 함
router.post('/', upload.single('file'), (req, res) => {
    // 파일이 정상적으로 올라갔으면
    const fileUrl = `/uploads/${req.file.filename}`;
    res.send(`
        <h1>파일 업로드 성공!</h1>
        <p>저장된 파일명: ${req.file.filename}</p>
        <p>파일 바로가기: <a href="${fileUrl}">${fileUrl}</a></p>
        <a href="/upload">돌아가기</a>
    `);
});

module.exports = router;