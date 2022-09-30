const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/authDemo')
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!")
        console.log(err)
    })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }));

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send('THIS IS THE HOME PAGE!')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    // check whether it is working - ultimatley you never want to do this
    // res.send(req.body)
    const { password, username } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    // session cookie remembering the successfully logged in user (same for register)
    req.session.user_id = user._id;
    // Checking whether the encryption worked
    // res.send(hash);
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    // first step to see whether its working
    // res.send(req.body)
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        // session cookie remembering the successfully logged in user (same for register)
        req.session.user_id = user._id;
        // to check whether it works first
        // res.send("YAY!!! WELCOME!!!")
        res.redirect('/secret');
    } else {
        // to check whether it works first
        // res.send("TRY AGAIN")
        res.redirect('/login');
    }
})

app.post('/logout', (req, res) => {
    // is usually enough
    req.session.user_id = null;
    // destroys the whole session id
    // req.session.destroy();
    res.redirect('/login');
})


// using middleware requireLogin (created above)
app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('TOP SECRET!!!!!')
})

// without middleware requireLogin
// app.get('/secret', (req, res) => {
//     if (!req.session.user_id) {
//         return res.redirect('/login')
//     }
//     // for testing it works first
//     // res.send('THIS IS SECRET! YOU CANNOT SEE ME UNLESS YOU ARE LOGGED IN!')
//     res.render('secret')
// })

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})