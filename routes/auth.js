// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // 아까 만든 db.js 연결

// 1. 회원가입 페이지 보여주기
router.get('/register', (req, res) => {
    res.render('register');
});

// 2. 회원가입 요청 처리 (취약한 코드)
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // ☠️ 보안 취약점: 사용자가 입력한 값을 그대로 쿼리에 갖다 붙임 (SQL Injection 가능)
    // 원래는 ? 를 써서 방어해야 하는데, 공부를 위해 일부러 이렇게 짭니다.
    const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;

    console.log("실행된 쿼리:", sql); // 터미널에서 쿼리 확인용

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.send(`<script>alert('회원가입 실패 (에러)'); location.href='/auth/register';</script>`);
        } else {
            res.send(`<script>alert('가입 성공!'); location.href='/';</script>`);
        }
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

// 4. 로그인 요청 처리 (★취약점 핵심★)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    //  취약한 코드: 입력값을 검증 없이 쿼리에 연결함
    // 해커가 아이디에 ' OR '1'='1 을 넣으면 비밀번호 없이 뚫림
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log("실행된 쿼리:", sql); // 터미널에서 해킹 쿼리 확인용

    db.query(sql, (err, results) => {
        if (err) throw err;

        // 결과가 1개라도 있으면 로그인 성공!
        if (results.length > 0) {
            // 세션에 유저 정보 저장 
            req.session.user = results[0];
            res.send(`<script>alert('로그인 성공! 환영합니다.'); location.href='/';</script>`);
        } else {
            res.send(`<script>alert('아이디 또는 비번이 틀렸습니다.'); location.href='/auth/login';</script>`);
        }
    });
});

// 5. 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;