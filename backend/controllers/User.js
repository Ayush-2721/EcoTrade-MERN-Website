const User=require("../models/User")
const { sanitizeUser } = require("../utils/SanitizeUser")

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await User.findById(id)
        const sanitized = sanitizeUser(result)
        res.status(200).json(sanitized)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}
exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await User.findByIdAndUpdate(id,req.body,{new:true})
        const sanitized = sanitizeUser(updated)
        res.status(200).json(sanitized)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}