const jwt =require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const authentication = async function (req, res, next) {
    try {
        
        let token = req.headers.authorization; 

        if(!token) return res.status(401).send({ status: false, message: "Token is Missing" });
     
        token = token.split(" ")[1];

        jwt.verify(token, "productmanagementgroup62",function(err,data){
            if(err){
                if(err.message == "invalid token") return res.status(400).send({status:false,message:"invalid token"})
                if(err.message == "invalid signature") return res.status(400).send({status:false,message:"Invalid token"})
                if(err.message == "jwt expired") return res.status(400).send({status:false,message:"token expired  once more login"})
            }else{
                req.userDetails = data;

                next()
            }
        });
        
    }catch (err) {return  res.status(500).send({status: false, message: "Serverside Errors Please try again later", error: err.message })}
 
    }

const authorisation = async function (req, res, next) {

    try {
        if(!mongoose.isValidObjectId(req.params.userId)) return res.status(400).send({ status: false, message : "please enter valid id" })
      
        if (req.userDetails._id != req.params.userId) {

        return res.status(403).send({ status: false, message: "you can't change other's data" })
        }
     next()
        
    }catch (err) {res.status(500).send({status: false ,message:err.message })}

}





module.exports = {authentication,authorisation}