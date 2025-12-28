import {axiosi} from '../../config/axios'

export const signup=async(cred)=>{
    try {
        const res=await axiosi.post("auth/signup",cred)
        return res.data
    } catch (error) {
        // normalize error to an Error with a message string so UI can display it cleanly
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const login=async(cred)=>{
    try {
        const res=await axiosi.post("auth/login",cred)
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const verifyOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/verify-otp",cred)
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const resendOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/resend-otp",cred)
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const forgotPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/forgot-password",cred)
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const resetPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/reset-password",cred)
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const checkAuth=async(cred)=>{
    try {
        const res=await axiosi.get("auth/check-auth")
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}
export const logout=async()=>{
    try {
        const res=await axiosi.get("auth/logout")
        return res.data
    } catch (error) {
        const serverData = error?.response?.data
        const message = typeof serverData === 'string' ? serverData : (serverData?.message || JSON.stringify(serverData) || error.message)
        throw new Error(message)
    }
}