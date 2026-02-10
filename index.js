if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
    // console.log(process.env.CLOUD_NAME);
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError.js');


const app = express();
const port = 8080;
// const MONGO_URL = "mongodb://localhost:27017/Wanderlust";
const dbUrl = process.env.ATLASDB_URL;

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require("./routes/user.js");
 

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(methodOverride("_method"));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE ",err);
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get('/demouser',async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });//Creating a fake User with email and username
    
//     let registeredUser = await User.register(fakeUser,"helloworld"); // register the user with a password in the user collection
//     res.send(registeredUser);

// })

// lisitngs routes 
app.use('/listings',listingRouter);
//Review Routes
app.use('/listings/:id/reviews',reviewRouter);

//signup
app.use('/',userRouter);

//Basic Page not found Route 
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    let {status=500,message="Something went wrong"}=err;
    console.log(err);
    res.status(status).render("error.ejs",{message});
});

//Connecting Port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// app.get('/testListing',async(req,res)=>{
//     const sample1 = new Listing({
//         title:"My new Villa",
//         description:"A beautiful villa with sea view",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     });
//     sample1.save().then(()=>{
//         console.log("Sample listing saved");
//     });
//     // console.log("Sample listing saved");
//     res.send("Sample listing created and saved to database");
// })
