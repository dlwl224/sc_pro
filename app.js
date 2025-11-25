// app.js 
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// 1. 화면 엔진(EJS) 설정
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// 2. 필수 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 3. 세션 설정 (로그인 유지용)
app.use(session({
    secret: 'security_training_key',
    resave: false,
    saveUninitialized: true,
}));

// 4. 라우터 파일 연결 
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const uploadRouter = require('./routes/upload');

app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/upload', uploadRouter);

// 5. 메인 페이지
app.get('/', (req, res) => {
    // index.ejs 파일을 찾아서 보여줌
    res.render('index', { user: req.session.user });
});

// 6. 서버 실행
app.listen(3000, () => {
    console.log('🚀 보안 실습 서버가 3000번 포트에서 실행 중입니다.');
});