require('./models/dbConnection');
const express    = require('express');
var cookieParser = require('cookie-parser');
const session    = require("express-session");
const bodyParser = require("body-parser");
const path       = require('path');
const routes     = require('./config/route'); 
const config     = require('./config/config');
const helper          = require('./helpers/my_helper');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json'); 
var app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false }));

app.use(cookieParser());

app.use(session({
    key   : config.sessID,
    secret: config.keys.secret,
    resave: true,
    saveUninitialized: false,
    cookie: {
      expires: 60000000
    }
  }));

app.use( async function(req, res, next) {
  res.locals.user = req.session.user;
  res.locals.webImages = await helper.getWebSetting('web_images');
  res.locals.webSetting = await helper.getWebSetting('webSetting');
  res.locals.config = config;

  next();
});
  
app.use('/', routes);

app.use((req, res, next) => {
    if (req.cookies[config.sessID] && !req.session.user) {
        res.clearCookie(config.sessID);        
    }
    next();
});

app.get('*',function (req, res) {
    res.redirect('/');
   /*console.log('req start: ',req.secure, req.hostname, req.originalurl, app.get('port'), req.get('host') , req.originalUrl, req.protocol);
    if (req.protocol == 'http') {
      res.redirect('https://' +
      req.get('host') + req.originalUrl);
    }*/
});


app.listen(config.PORT, () => {
    console.log('Express server started at port : '+ config.PORT);
});

