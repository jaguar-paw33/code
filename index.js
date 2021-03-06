const express = require('express');
const env = require('./config/environment');
const logger = require('morgan');
const app = express();
const port = 8000;
const db = require('./config/mongoose');
const expressLayouts = require('express-ejs-layouts');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const sassMiddleware = require('node-sass-middleware');
const passport = require('passport');
const localStrategy = require('./config/passport_local_stratgey');
const jwtStrategy = require('./config/passport-jwt-strategy');
const googleStrategy = require('./config/passport-google-oauth-strategy');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const customMware = require('./config/middleware');
const chatServer = require('http').Server(app);
const chatSocket = require('./config/chatSockets').chatSockets(chatServer);
chatServer.listen(5000);
const path = require('path');
require('./config/view_helper')(app);


if(env.name=='development'){
    app.use(sassMiddleware({
        src:path.join(__dirname,env.assets_path,'scss'),
        dest:path.join(__dirname,env.assets_path,'css'),
        debug:false,
        outputStyle:'expanded',
        prefix:'/css'
    }))
}

app.use(logger(env.morgan.mode,env.morgan.options));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(express.static('./assets'));
app.use('/uploads', express.static(__dirname +'/uploads'));
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);


app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
    name:'codeial',
    secret:env.session_cookie_secret,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: (1000*60*10)
    },store: new MongoStore({
        mongooseConnection:db,
        autoRemove:'disabled'
    }), function(err){ console.log( err || 'MongoStore Session Ok');
        }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

app.use('/', require('./routes/index'));


app.listen(port, function(err){
    if(err){
        console.log(`Error in Starting Server ${err}`);
        return;
    }
    console.log(`Server is up at Port :: ${port}`);
    
})