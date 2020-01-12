const Usermodel = require('../models/usermodel')
const Bcrypt = require('../helper/hashpassword')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')

class User{
    static googlesignin(req,res,next){
        let temporary = null
        const client = new OAuth2Client('376671315610-fpp2033jq5mpkqssqe367eekt13fiits.apps.googleusercontent.com');
        async function verify() {
        const ticket = await client.verifyIdToken({
        idToken: req.body.idtoken,
        audience: '376671315610-fpp2033jq5mpkqssqe367eekt13fiits.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        temporary = payload
        
        return payload
        }
        verify()
        .then((data)=>{
            return Usermodel.findOne({
                email: data.email
            })
        })
        .then((data)=>{
            if(data === null){
                return Usermodel.create({
                    first_name: temporary.given_name,
                    last_name: temporary.family_name,
                    email: temporary.email,
                    password: 'tesss'
                })
            }
            return data
        })
        .then((data)=>{
            const payload = {userid: data._id}
            let token = jwt.sign(payload, 'secret')
            res.status(200).json({token})
        })
        .catch((err)=>{
            next(err)
        });
    }
    static signup(req,res,next){
        Usermodel.create(req.body)
        .then((data)=>{
            res.status(201).json(data)
        })
    }

    static signin(req, res, next){
        let userid = null
        Usermodel.findOne({
            email: req.body.email
        })
        .then((data)=>{
            if(data === null){
                res.status(400).json({message: 'Wrong email/password'})
            }else{
                userid = data['_id']
                return Bcrypt.compare(req.body.password, data.password)
            }
        })
        .then((status)=>{
            if(status){
                let token = jwt.sign({userid}, 'secret')
                res.json({token})
            } else {
                res.status(400).json({message: 'Wrong email/password'})
            }
        })
    }

    static sendwa(req,res,next){


    }

}


module.exports = User