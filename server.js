const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRoute.js');
const weatherRouter = require('./routes/weatherRoute.js');
const logoutRoute = require("./routes/logoutRoute.js")
const countryRouter = require('./routes/countryRoute.js');
const airportsRouter = require('./routes/airportsRoute');
const dbURL = "mongodb+srv://Cluster83833:arsen@cluster0.aslgnhw.mongodb.net/?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: '1111',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use((req, res, next) => {
  // Default isAdmin to false if not logged in or not set
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/views'));


app.use('/', logoutRoute);
app.use("/", userRouter);
app.use("/weather", weatherRouter);
app.use("/weather", countryRouter);
app.use("/airports", airportsRouter);



mongoose.connect(dbURL).then(async () => {
  app.listen(3000, () => {
    console.log("Connected to database and listening on port 3000");
  });
}).catch((err) => console.error('Error connecting to database:', err));


