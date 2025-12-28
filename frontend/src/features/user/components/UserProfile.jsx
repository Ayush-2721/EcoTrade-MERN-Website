import { Avatar, Button, Paper, Stack, Typography, useTheme, TextField, useMediaQuery, IconButton, Grid, Card, CardContent, Divider, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUserInfo } from '../UserSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { axiosi } from '../../../config/axios'
import { updateUserByIdAsync } from '../UserSlice'
import { addAddressAsync, resetAddressAddStatus, resetAddressDeleteStatus, resetAddressUpdateStatus, selectAddressAddStatus, selectAddressDeleteStatus, selectAddressErrors, selectAddressStatus, selectAddressUpdateStatus, selectAddresses } from '../../address/AddressSlice'
import { Address } from '../../address/components/Address'
import { useForm } from 'react-hook-form'
import { LoadingButton } from '@mui/lab'
import {toast} from 'react-toastify'
import { motion } from 'framer-motion'
import { ProfileSkeleton, SkeletonGlobalStyles } from '../../../components/Skeletons/Skeletons'

export const UserProfile = () => {

    const dispatch=useDispatch()
    const {register,handleSubmit,watch,reset,formState: { errors }} = useForm()
    const status=useSelector(selectAddressStatus)
    const userInfoFromStore=useSelector(selectUserInfo)
    const loggedInUser=useSelector(selectLoggedInUser)
    const userInfo = userInfoFromStore || loggedInUser
    const addresses=useSelector(selectAddresses)
    const theme=useTheme()
    const [addAddress,setAddAddress]=useState(false)
    const [uploading,setUploading]=useState(false)

    
    const addressAddStatus=useSelector(selectAddressAddStatus)
    const addressUpdateStatus=useSelector(selectAddressUpdateStatus)
    const addressDeleteStatus=useSelector(selectAddressDeleteStatus)

    const is900=useMediaQuery(theme.breakpoints.down(900))
    const is480=useMediaQuery(theme.breakpoints.down(480))

    useEffect(()=>{
        console.log('UserProfile - userInfo:', userInfo)
        console.log('UserProfile - userInfoFromStore:', userInfoFromStore)
        console.log('UserProfile - loggedInUser:', loggedInUser)
    },[userInfo])

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])


    useEffect(()=>{
        if(addressAddStatus==='fulfilled'){
            toast.success("Address added")
        }
        else if(addressAddStatus==='rejected'){
            toast.error("Error adding address, please try again later")
        }
    },[addressAddStatus])

    useEffect(()=>{

        if(addressUpdateStatus==='fulfilled'){
            toast.success("Address updated")
        }
        else if(addressUpdateStatus==='rejected'){
            toast.error("Error updating address, please try again later")
        }
    },[addressUpdateStatus])

    useEffect(()=>{

        if(addressDeleteStatus==='fulfilled'){
            toast.success("Address deleted")
        }
        else if(addressDeleteStatus==='rejected'){
            toast.error("Error deleting address, please try again later")
        }
    },[addressDeleteStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetAddressAddStatus())
            dispatch(resetAddressUpdateStatus())
            dispatch(resetAddressDeleteStatus())
        }
    },[])

    const handleAddAddress=(data)=>{
        const address={...data,user:userInfo._id}
        dispatch(addAddressAsync(address))
        setAddAddress(false)
        reset()
    }

    if(!userInfo) {
        return (
            <>
                <SkeletonGlobalStyles />
                <ProfileSkeleton />
            </>
        )
    }

    return (
    <Box sx={{minHeight: '100vh', backgroundColor: '#f5f7fa', py: 4, pt: { xs: '5rem', md: '4.5rem' }}}>
        <Stack maxWidth="1200px" margin="0 auto" spacing={4} px={is480 ? 2 : 0}>
            
            {/* Profile Header Card */}
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                <Card elevation={0} sx={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 2, overflow: 'hidden'}}>
                    <CardContent>
                        <Stack spacing={3}>
                            <Stack direction={is480 ? 'column' : 'row'} spacing={3} alignItems="center">
                                {/* Avatar Section */}
                                <Box position="relative">
                                    <Avatar 
                                        src={userInfo?.avatar || ''} 
                                        alt={userInfo?.name} 
                                        sx={{
                                            width: is480 ? 100 : 140,
                                            height: is480 ? 100 : 140,
                                            border: '4px solid white',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Stack direction="row" sx={{position: 'absolute', bottom: -10, right: -10, gap: 0.5}}>
                                        <label htmlFor="upload-avatar">
                                            <input 
                                                style={{display:'none'}} 
                                                accept='image/*' 
                                                id="upload-avatar" 
                                                type='file' 
                                                onChange={async(e)=>{
                                                    const file = e.target.files[0]
                                                    if(!file) return
                                                    try{
                                                        setUploading(true)
                                                        const form = new FormData()
                                                        form.append('file', file)
                                                        const res = await axiosi.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
                                                        const url = res.data.url
                                                        dispatch(updateUserByIdAsync({_id: userInfo._id, avatar: url}))
                                                        toast.success('Avatar updated successfully!')
                                                    }catch(err){
                                                        console.error(err)
                                                        toast.error('Error uploading avatar')
                                                    }finally{setUploading(false)}
                                                }} 
                                            />
                                            <IconButton 
                                                component={'span'} 
                                                size='small' 
                                                sx={{
                                                    backgroundColor: '#4CAF50',
                                                    color: 'white',
                                                    '&:hover': {backgroundColor: '#45a049'}
                                                }}
                                            >
                                                <PhotoCamera fontSize="small" />
                                            </IconButton>
                                        </label>
                                        <IconButton 
                                            onClick={async()=>{
                                                try{
                                                    dispatch(updateUserByIdAsync({_id: userInfo._id, avatar: ''}))
                                                    toast.success('Avatar removed!')
                                                }catch(err){console.error(err)}
                                            }} 
                                            size='small' 
                                            sx={{
                                                backgroundColor: '#ff6b6b',
                                                color: 'white',
                                                '&:hover': {backgroundColor: '#ee5a52'}
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>

                                {/* User Info */}
                                <Stack spacing={1} flex={1}>
                                    <Typography variant="h4" fontWeight={700}>{userInfo?.name || 'User'}</Typography>
                                    <Typography variant="body1" sx={{opacity: 0.9}}>{userInfo?.email}</Typography>
                                    <Typography variant="body2" sx={{opacity: 0.8}}>
                                        Member since {
                                            userInfo?.createdAt 
                                                ? (() => {
                                                    try {
                                                        const date = new Date(userInfo.createdAt)
                                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
                                                    } catch {
                                                        return 'N/A'
                                                    }
                                                })()
                                                : 'N/A'
                                        }
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Addresses Section */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay: 0.1}}>
                <Stack spacing={3}>
                    {/* Section Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={1}>
                            <Typography variant="h5" fontWeight={700} sx={{color: '#1a1a2e'}}>
                                Delivery Addresses
                            </Typography>
                            <Typography variant="body2" sx={{color: '#666'}}>
                                Manage your delivery addresses
                            </Typography>
                        </Stack>
                        {!addAddress && (
                            <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                <Button 
                                    onClick={()=>setAddAddress(true)} 
                                    variant='contained' 
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.2,
                                        px: 3,
                                        borderRadius: 1
                                    }}
                                >
                                    + Add New Address
                                </Button>
                            </motion.div>
                        )}
                    </Stack>

                    {/* Add Address Form - Dialog */}
                    <Dialog open={addAddress} onClose={() => setAddAddress(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{fontWeight: 700, fontSize: '1.3rem', color: '#1a1a2e'}}>
                            Add New Address
                        </DialogTitle>
                        <Divider />
                        <DialogContent sx={{pt: 3}}>
                            <Stack component={'form'} spacing={2.5} id="address-form" onSubmit={handleSubmit(handleAddAddress)}>
                                <TextField 
                                    fullWidth
                                    label="Address Type" 
                                    placeholder='E.g. Home, Office, Other' 
                                    {...register("type",{required:"Type is required"})}
                                    variant="outlined"
                                    size="small"
                                    error={!!errors.type}
                                    helperText={errors.type?.message}
                                />
                                <TextField 
                                    fullWidth
                                    label="Street Address" 
                                    {...register("street",{required:"Street is required"})}
                                    variant="outlined"
                                    size="small"
                                    error={!!errors.street}
                                    helperText={errors.street?.message}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField 
                                            fullWidth
                                            label="City" 
                                            {...register("city",{required:"City is required"})}
                                            variant="outlined"
                                            size="small"
                                            error={!!errors.city}
                                            helperText={errors.city?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            fullWidth
                                            label="State" 
                                            {...register("state",{required:"State is required"})}
                                            variant="outlined"
                                            size="small"
                                            error={!!errors.state}
                                            helperText={errors.state?.message}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField 
                                            fullWidth
                                            label="Postal Code" 
                                            type='number' 
                                            {...register("postalCode",{required:"Postal Code is required"})}
                                            variant="outlined"
                                            size="small"
                                            error={!!errors.postalCode}
                                            helperText={errors.postalCode?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            fullWidth
                                            label="Country" 
                                            {...register("country",{required:"Country is required"})}
                                            variant="outlined"
                                            size="small"
                                            error={!!errors.country}
                                            helperText={errors.country?.message}
                                        />
                                    </Grid>
                                </Grid>
                                <TextField 
                                    fullWidth
                                    label="Phone Number" 
                                    type='number' 
                                    {...register("phoneNumber",{required:"Phone Number is required"})}
                                    variant="outlined"
                                    size="small"
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber?.message}
                                />
                            </Stack>
                        </DialogContent>
                        <Divider />
                        <DialogActions sx={{p: 2, gap: 1}}>
                            <Button 
                                onClick={()=> {setAddAddress(false); reset();}} 
                                variant="outlined"
                                color="inherit"
                            >
                                Cancel
                            </Button>
                            <LoadingButton 
                                loading={status==='pending'} 
                                type='submit' 
                                form='address-form'
                                variant='contained'
                                sx={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                            >
                                Add Address
                            </LoadingButton>
                        </DialogActions>
                    </Dialog>

                    {/* Addresses Grid */}
                    {addresses && addresses.length > 0 ? (
                        <Grid container spacing={2}>
                            {addresses.map((address) => (
                                <Grid item xs={12} sm={6} md={6} key={address._id}>
                                    <Address 
                                        id={address._id} 
                                        city={address.city} 
                                        country={address.country} 
                                        phoneNumber={address.phoneNumber} 
                                        postalCode={address.postalCode} 
                                        state={address.state} 
                                        street={address.street} 
                                        type={address.type}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        !addAddress && (
                            <Box sx={{textAlign: 'center', py: 5, backgroundColor: '#f9f9f9', borderRadius: 2}}>
                                <LocationOnIcon sx={{fontSize: 60, color: '#ccc', mb: 2}} />
                                <Typography variant='body1' sx={{color: '#999'}}>
                                    No addresses added yet. Add one to get started!
                                </Typography>
                            </Box>
                        )
                    )}
                </Stack>
            </motion.div>

        </Stack>
    </Box>
  )
}
