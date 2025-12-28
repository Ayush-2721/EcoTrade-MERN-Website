import { LoadingButton } from '@mui/lab'
import { Button, Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Card, CardContent, CardActions, Divider, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import PlaceIcon from '@mui/icons-material/Place'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { deleteAddressByIdAsync, selectAddressErrors, selectAddressStatus, updateAddressByIdAsync } from '../AddressSlice'
import { motion } from 'framer-motion'

export const Address = ({id,type,street,postalCode,country,phoneNumber,state,city}) => {

    const theme=useTheme()
    const dispatch=useDispatch()
    const {register,handleSubmit,watch,reset,formState: { errors }} = useForm()
    const [editOpen, setEditOpen]=useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false);
    const status=useSelector(selectAddressStatus)
    const error=useSelector(selectAddressErrors)
    
    const is480=useMediaQuery(theme.breakpoints.down(480))

    const handleRemoveAddress=()=>{
        dispatch(deleteAddressByIdAsync(id))
        setDeleteOpen(false)
    }

    const handleUpdateAddress=(data)=>{
        const update={...data,_id:id}
        setEditOpen(false)
        dispatch(updateAddressByIdAsync(update))
    }

  return (
    <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.3}}>
        <Card 
            sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    transform: 'translateY(-4px)'
                }
            }}
            elevation={0}
        >
            {/* Address Type Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                px: 2,
                py: 1.5,
                borderRadius: '4px 4px 0 0'
            }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={700} textTransform="uppercase">
                        {type}
                    </Typography>
                </Stack>
            </Box>

            <CardContent sx={{pb: 1}}>
                {/* Display Mode */}
                {!editOpen ? (
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <PlaceIcon sx={{color: '#667eea', mt: 0.5, flexShrink: 0}} />
                            <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                    Street Address
                                </Typography>
                                <Typography variant="body2" sx={{color: '#333'}}>
                                    {street}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Divider sx={{my: 0.5}} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                        City
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#333'}}>
                                        {city}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                        State
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#333'}}>
                                        {state}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                        Postal Code
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#333'}}>
                                        {postalCode}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                        Country
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#333'}}>
                                        {country}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Divider sx={{my: 0.5}} />

                        <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneIcon sx={{color: '#667eea', fontSize: '1.2rem'}} />
                            <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'}}>
                                    Phone Number
                                </Typography>
                                <Typography variant="body2" sx={{color: '#333'}}>
                                    {phoneNumber}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    /* Edit Mode */
                    <Stack component="form" spacing={2} id={`address-form-${id}`} onSubmit={handleSubmit(handleUpdateAddress)}>
                        <TextField 
                            fullWidth
                            label="Address Type"
                            defaultValue={type}
                            {...register("type", {required: "Type is required"})}
                            size="small"
                            error={!!errors.type}
                            helperText={errors.type?.message}
                        />
                        <TextField 
                            fullWidth
                            label="Street Address"
                            defaultValue={street}
                            {...register("street", {required: "Street is required"})}
                            size="small"
                            error={!!errors.street}
                            helperText={errors.street?.message}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField 
                                    fullWidth
                                    label="City"
                                    defaultValue={city}
                                    {...register("city", {required: "City is required"})}
                                    size="small"
                                    error={!!errors.city}
                                    helperText={errors.city?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField 
                                    fullWidth
                                    label="State"
                                    defaultValue={state}
                                    {...register("state", {required: "State is required"})}
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
                                    type="number"
                                    defaultValue={postalCode}
                                    {...register("postalCode", {required: "Postal Code is required"})}
                                    size="small"
                                    error={!!errors.postalCode}
                                    helperText={errors.postalCode?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField 
                                    fullWidth
                                    label="Country"
                                    defaultValue={country}
                                    {...register("country", {required: "Country is required"})}
                                    size="small"
                                    error={!!errors.country}
                                    helperText={errors.country?.message}
                                />
                            </Grid>
                        </Grid>
                        <TextField 
                            fullWidth
                            label="Phone Number"
                            type="number"
                            defaultValue={phoneNumber}
                            {...register("phoneNumber", {required: "Phone Number is required"})}
                            size="small"
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber?.message}
                        />
                    </Stack>
                )}
            </CardContent>

            {/* Action Buttons */}
            <CardActions sx={{pt: 0, gap: 1, justifyContent: 'flex-end'}}>
                {!editOpen ? (
                    <>
                        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <Button 
                                startIcon={<EditIcon />}
                                onClick={() => setEditOpen(true)} 
                                variant='contained'
                                size='small'
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Edit
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <Button 
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteOpen(true)} 
                                variant='outlined'
                                color='error'
                                size='small'
                                sx={{textTransform: 'none', fontWeight: 600}}
                            >
                                Remove
                            </Button>
                        </motion.div>
                    </>
                ) : (
                    <>
                        <LoadingButton 
                            loading={status === 'pending'} 
                            type='submit'
                            form={`address-form-${id}`}
                            variant='contained'
                            size='small'
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Save Changes
                        </LoadingButton>
                        <Button 
                            onClick={() => {setEditOpen(false); reset()}}
                            variant='outlined' 
                            color='inherit'
                            size='small'
                            sx={{textTransform: 'none', fontWeight: 600}}
                        >
                            Cancel
                        </Button>
                    </>
                )}
            </CardActions>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle sx={{fontWeight: 700, fontSize: '1.1rem'}}>
                    Delete Address
                </DialogTitle>
                <Divider />
                <DialogContent sx={{pt: 2}}>
                    <Typography>
                        Are you sure you want to delete this {type} address? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <Divider />
                <DialogActions sx={{p: 2, gap: 1}}>
                    <Button 
                        onClick={() => setDeleteOpen(false)}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <LoadingButton 
                        loading={status === 'pending'}
                        onClick={handleRemoveAddress}
                        variant='contained'
                        color='error'
                    >
                        Delete
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Card>
    </motion.div>
  )
}
