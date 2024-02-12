const User = require("../models/userModel.js");
const Weather = require("../models/weatherModel.js");
const bcrypt = require('bcryptjs');

const getAllUser = async(req,res,next) => {
    let users
    try {
        users = await User.find()
    }catch (err){
        console.log(err)
    }
    if (!users) {
        return res.status(404).json({message: "no users found"})
    }
    return res.status(200).json({users})
}

const signup = async (req,res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let existingUser;
    try{
        existingUser = await User.findOne({email})
    }catch (err){
       return  console.log(err)
    }
    if (existingUser){
        return res.status(400).json({message:"user already exists"})
    }
    const hashedPassword = bcrypt.hashSync(password)
    const user = new User({
        username, 
        email,
        password: hashedPassword,
        });
    
    try {
        await user.save();
        req.session.userId = user._id.toString();
        req.session.save(err => { 
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: "Session error, please try again." });
            }
            res.redirect('/weather');
        });
    }catch(err){
        return console.log(err)
    }
}

const login = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let existingUser;
    try{
        existingUser = await User.findOne({email})
    }catch (err){
       return  console.log(err)
    }
    if (!existingUser){
        return res.status(404).json({message:"user is not found by this email"})
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password)

    if (!isPasswordCorrect){
        return res.status(400).json({message:"incorrect password"})
    }
    req.session.userId = existingUser._id.toString();
    req.session.save(err => {
        if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Session error, please try again." });
        }
        res.redirect('/weather');
    });   
}

const getHistory = async (req, res, next) => {
    const userId = req.session.userId;
    console.log("Session UserID:", req.session.userId);
    try {
        const user = await User.findById(userId).populate('history');
        if (!user) {
            return res.status(404).json({ message: "history not found" });
        }
        res.render('history', { user: user, history: user.history });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching user history" });
    }
};


const getSignUp = async(req,res,next)=>{
    res.render('signup');
}

const getLogin = async(req,res,next)=>{
    res.render('login');
}

module.exports = {
    getAllUser,
    getSignUp,
    getLogin,
    signup,
    login,
    getHistory,
};