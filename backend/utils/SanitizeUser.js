exports.sanitizeUser=(user)=>{
    const userObj = user.toObject ? user.toObject() : user
    console.log('SanitizeUser - Input user:', user)
    console.log('SanitizeUser - userObj:', userObj)
    console.log('SanitizeUser - createdAt:', userObj.createdAt)
    const sanitized = {_id:userObj._id,name:userObj.name,email:userObj.email,avatar:userObj.avatar,isVerified:userObj.isVerified,isAdmin:userObj.isAdmin,createdAt:userObj.createdAt}
    console.log('SanitizeUser - sanitized result:', sanitized)
    return sanitized
}