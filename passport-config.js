const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user')

function initialize(passport,user,getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await User.findOne({
            email: email
        })
        if (user == null) {
            return done(null, false, {       //3 parameters of done => //err,noUser,message
                message: "No User With That Email"
            })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect Password' })
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null,user));
    passport.deserializeUser((id, done) => { 
        return done(null,getUserById(id))
     })
};

module.exports = initialize 