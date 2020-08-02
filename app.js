// mongo db async로 하는 거 연습함, morgan app.use 쓰는 거 틀림
// login 화면만 login layout로 쓰고 나머지는 main 씀
// materialize css랑 javascript cdn 다 긁어와야함. 다 쓸 거니까. font awesome은 css로
// 공통 css 적용하는 거 path 써서 해주기, hbs에 경로 넣어줘야 하는 거 까먹음, public도 안 써도 됨
// 참고로 const passport임. passport google oauth20 아니다!!!
// mongodb 들어가보면 내가 user에 입력한 형태대로 저장되어 있음. 즉 user는 그냥 내가 쓰기 나름.
// side-nav될려면 필수 조건 1. 누르고자 하는 elem class에 sidenav-trigger
// 2. data-target(누르고자 하는)과 id mobile-demo(눌리는)로 해주기
// https://www.quora.com/Why-is-it-good-practice-to-store-session-IDs-in-a-database 왜 세션에도 저장해야 하는가
// story model 따로 만든 이유는 story 형태로 session에 저장하려고
// req.user는 passport를 쓰면 나오는 애다. 로그인된 사람을 가리킴. 그리고 _id는 각 항목마다 고유값으로써 모든 항목에 존재
// _id를 나타내는 req.user.id는 models를 어떻게 만들건 있다는 소리!
// req.user vs req.body
// render와 redirect는 안에 링크 거는 법도 다르다 / table materialize에서 보고 하면 됨. format 틀림
// https://materializecss.com/floating-action-button.html floating materialize 가져옴
// https://materializecss.com/select.html select materialize서 가져옴
// https://ckeditor.com/docs/ckeditor4/latest/examples/classic.html 에서 가져옴, 특이점은 replace는 name으로 지정된 애를 따라감
// bodyparser쓰면 req.body 다룰 수 있음, 둘이 연관됨 + post request에서 name 하에 제출되는 각 항목들이 req.body에 속함
// models schema는 mongodb에 저장하는 방식을 설정 vs bodyparser(req.body)는 post 등 서버 관련
// 고민 후 알아낸 사실->form으로 제출하는 항목들 name을 schema와 같게 하여 둘을 연관짓고
// form에 적는 값으로 schema 각 항목의 내용을 설정함. 이때 Story.create(req.body) 씀
// db에 저장된 거 보니 req.body와 겹치는 내용만 적혀져 있음.
// req.body.user = req.user.id;로 user 항목을 새로 만듦. 원래는 req.body에 user 없음
// helpers 우리가 직접 custom으로 만들고 있는 것. function 써줘야 됨
// populate도 ref 써진 항목에 대해서만 쓸 수 있음, index에 user 이 부분 쓰려고 route에 populate 씀
// 그리고 각 view 파일마다 route에서 stories 따로 정의해줘서 stories를 연결(passin)해줘야 됨
// editIcon storyuser랑 login된 user가 같으면 floating, 다르면 아무것도 리턴 안 함
// mongo db에 id 없애고 실험하던 거 깜빡. editIcon helper 안 되서 헤맴
// index에 card 꾸미는 방식 https://materializecss.com/cards.html
// https://www.tutorialspoint.com/nodejs/nodejs_request_object.htm / req.params.?는 user/:?에서 ?를 지칭할 때 쓰임
// edit page에 제목이랑 내용 등 미리 적혀져 있는 내용 처리 해줘야 됨. 다만 select는 그렇게 하려면 helper 필요
// override node js에서 put이나 delete 하려면 깔아줘야 됨, 공식 doc에서 베껴오기
// 다만 PUT을 하건 DELETE을 하건 ROUTE에다가 경로 설정은 따로 또 해줘야 하는 거 잊지말기
// put은 findandupdate, delete는 remove 써준다. 신기한 게 override라는 이름 답게 <form>안에 post 밑으로 각각 써줘야 됨
// 여기서는 즉 두 개의 post 안에 각각 put과 delete를 써줬다(이거 땜에 post 새로 만들어 줌). 로직 털림
// template의 form에서 보내는 주소와 put과 post에서 보내는 주소가 같아야 됨
// put, delete 로직-> story가 있는지 확인, 없으면 에러 - 스토리 쓴 사람이랑 로그인 된 애랑 같은지 확인, 같으면 진행, 안 같으면 에러
// story = await Story() 이런 방식 다 하는 거 아님. passin 등 필요한 경우만 해주는 거임.
// 기본 컨셉 - 각 user와 story마다 _id는 존재함. 그러나 유저마다 자기 이야기만 접근할 수 있게 이야기들을 유저의 _id로 다 연결해 줌, ref 사용
// 이야기들마다 존재하는 _id는 각각의 이야기들을 지우고 수정하는 등에 사용, 물론 이떄도 유저의 _id와 이야기 속에 들어있는 유저의 _id가 같아야 가능
// {{!-- story.user가 어차피 id 형태이긴 한데, 그냥 story의 user라고 일컬음. 물론 story.user._id도 가능 --}}
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const path = require("path");
const morgan = require("morgan");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
connectDB();
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

require("./config/passport")(passport);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require("./helpers/hbs");
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, truncate, stripTags, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`server connected in ${process.env.NODE_ENV} mode on ${PORT}`)
);
