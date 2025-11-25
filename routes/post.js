// routes/post.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. 게시글 목록 보기
router.get('/', (req, res) => {
    // 로그인 안 했으면 로그인 창으로 쫓아냄
    if (!req.session.user) {
        return res.send(`<script>alert('로그인이 필요합니다.'); location.href='/auth/login';</script>`);
    }

    const sql = 'SELECT * FROM posts ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('post_list', { posts: results, user: req.session.user });
    });
});

// 2. 글쓰기 페이지 보여주기
router.get('/write', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('post_write');
});

// 3. 글 작성 요청 처리 (★ Stored XSS 취약점 구간 ★)
router.post('/write', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { title, content } = req.body;
    const user_id = req.session.user.id; // 현재 로그인한 사람 ID

    // ☠️ 취약점: <script> 태그를 걸러내지 않고 그대로 저장함
    const sql = `INSERT INTO posts (title, content, user_id) VALUES ('${title}', '${content}', ${user_id})`;
    
    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.send('DB Error');
        }
        res.redirect('/post'); // 작성 후 목록으로 이동
    });
});


// 4. 수정 페이지 보여주기 (GET)
// ☠️ 취약점: 남의 글 수정 페이지에도 그냥 들어갈 수 있음 (접근 제어 미흡)
router.get('/edit/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.send('글이 없습니다.');
        res.render('post_edit', { post: results[0] });
    });
});

// 5. 수정 요청 처리 (POST) - ★ IDOR 핵심 취약점 ★
router.post('/edit/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    const { title, content } = req.body;
    const id = req.params.id; // URL에 있는 글 번호

    // ☠️ 취약점: 작성자가 본인인지(user_id) 확인 안 하고, 글 번호(id)만 맞으면 덮어씀!
    const sql = `UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${id}`;
    
    console.log("🔥 [IDOR 공격 로그] 실행된 쿼리:", sql);
    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.send('DB Error');
        }
        res.redirect('/post');
    });
});

module.exports = router;
