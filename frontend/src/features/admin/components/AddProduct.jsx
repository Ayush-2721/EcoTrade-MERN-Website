import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate} from 'react-router-dom'
import { addProductAsync, resetProductAddStatus, selectProductAddStatus, selectProductErrors, updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme, Autocomplete, Card, CardContent, Box, Grid, IconButton } from '@mui/material'
import { useForm, Controller } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'
import { axiosi } from '../../../config/axios'
import { motion } from 'framer-motion'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export const AddProduct = () => {

    const {register,handleSubmit,reset,formState: { errors }, control } = useForm()

    const dispatch=useDispatch()
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const productAddStatus=useSelector(selectProductAddStatus)
    const productErrors=useSelector(selectProductErrors)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))

    useEffect(()=>{
        if(productAddStatus==='fulfilled'){
            reset()
            toast.success("✅ New product added successfully!")
            setTimeout(() => {
                navigate("/admin/dashboard")
            }, 2000)
        }
        else if(productAddStatus==='rejected'){
            let errorMsg = 'Error adding product, please try again later'
            if(typeof productErrors === 'string') {
                errorMsg = productErrors
            } else if(productErrors?.message) {
                errorMsg = productErrors.message
            } else if(productErrors?.data?.message) {
                errorMsg = productErrors.data.message
            }
            console.error('Product add error:', errorMsg)
            toast.error(`❌ ${errorMsg}`)
        }
    },[productAddStatus, dispatch, navigate, reset, productErrors])

    useEffect(()=>{
        return ()=>{
            dispatch(resetProductAddStatus())
        }
    },[])

    const uploadFile = async (file) => {
        const form = new FormData()
        form.append('file', file)
        const res = await axiosi.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        return res.data.url
    }

    const handleAddProduct=async(data)=>{
        console.log('handleAddProduct called with data:', data)
        console.log('Brand value:', data.brand, 'Type:', typeof data.brand)
        console.log('Current form errors:', errors)
        
        try{
            toast.info('Processing your product...')
            
            // upload thumbnail if provided
            let thumbnailUrl = ''
            if(data.thumbnail && data.thumbnail.length>0){
                try {
                    console.log('Uploading thumbnail...')
                    thumbnailUrl = await uploadFile(data.thumbnail[0])
                    console.log('Thumbnail uploaded:', thumbnailUrl)
                } catch (err) {
                    console.error('Thumbnail upload error:', err)
                    toast.error('Error uploading thumbnail image')
                    return
                }
            } else {
                // Use a default image if no thumbnail provided
                thumbnailUrl = 'https://via.placeholder.com/400x400?text=Product+Image'
            }

            // upload images
            const images = []
            for(let i=0;i<4;i++){
                const key = `image${i}`
                if(data[key] && data[key].length>0){
                    try {
                        console.log(`Uploading image ${i}...`)
                        const url = await uploadFile(data[key][0])
                        images.push(url)
                        console.log(`Image ${i} uploaded:`, url)
                    } catch (err) {
                        console.error(`Image ${i} upload error:`, err)
                    }
                }
            }

            // If no images provided, add a default image
            if(images.length === 0) {
                images.push('https://via.placeholder.com/400x400?text=Product+Image')
            }

            const newProduct = {
                title: data.title,
                brand: data.brand,
                category: data.category,
                description: data.description,
                price: parseFloat(data.price),
                discountPercentage: parseFloat(data.discountPercentage),
                stockQuantity: parseInt(data.stockQuantity),
                condition: data.condition,
                thumbnail: thumbnailUrl,
                images
            }

            console.log('Submitting product:', newProduct)
            toast.info('Submitting product to server...')
            dispatch(addProductAsync(newProduct))
        }catch(err){
            console.error('Add product error:', err)
            toast.error('Error adding product, please try again')
        }
    }

    
  return (
    <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef7 50%, #f0f4ff 100%)',
        py: 4,
        pt: { xs: '5rem', md: '4.5rem' },
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
            pointerEvents: 'none'
        }
    }}>
        <Stack maxWidth="1000px" margin="0 auto" spacing={4} px={is480 ? 2 : 0} sx={{position: 'relative', zIndex: 1}}>
            
            {/* Header Section */}
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {!is480 && (
                            <motion.div whileHover={{x: -5}}>
                                <IconButton component={Link} to={"/admin/dashboard"} sx={{color: '#667eea'}}>
                                    <ArrowBackIcon fontSize='large'/>
                                </IconButton>
                            </motion.div>
                        )}
                        <Stack spacing={1}>
                            <Typography variant='h4' fontWeight={700} sx={{color: '#1a1a2e'}}>
                                Add New Product
                            </Typography>
                            <Typography sx={{color: '#666', maxWidth: '500px'}}>
                                Fill in the details below to add a new product to your store.
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </motion.div>

            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
                <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}>
                    <Card elevation={0} sx={{background: '#ffebee', border: '2px solid #ff6b6b', borderRadius: 2}}>
                        <CardContent>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{color: '#d32f2f', fontSize: '1.5rem'}}>⚠️</Box>
                                    <Typography fontWeight={600} sx={{color: '#d32f2f'}}>
                                        Please fix the following errors:
                                    </Typography>
                                </Stack>
                                {Object.entries(errors).map(([field, error]) => (
                                    <Typography key={field} variant="body2" sx={{color: '#d32f2f', ml: 4}}>
                                        • {field}: {error?.message}
                                    </Typography>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Main Form Card */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, delay: 0.1}}>
                <Card elevation={0} sx={{background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2}}>
                    <CardContent sx={{p: 4}}>
                        <Stack component={'form'} noValidate onSubmit={handleSubmit(handleAddProduct)} spacing={4}>

                            {/* Title Section */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Product Information
                                </Typography>
                                <TextField 
                                    fullWidth
                                    label="Product Title" 
                                    placeholder="Enter product title"
                                    {...register("title",{required:'Title is required'})} 
                                    error={!!errors.title} 
                                    helperText={errors.title?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            '&:hover fieldset': {
                                                borderColor: '#667eea'
                                            }
                                        }
                                    }}
                                />
                            </Stack>

                            {/* Brand & Category Row */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Classification
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth error={!!errors.brand}>
                                            <Controller
                                                name="brand"
                                                control={control}
                                                rules={{ 
                                                    required: 'Brand is required',
                                                    validate: (value) => {
                                                        if(!value || value === '') return 'Please select or enter a brand'
                                                        return true
                                                    }
                                                }}
                                                render={({ field }) => {
                                                    const selected = brands.find(b=>b._id===field.value) || (typeof field.value === 'string' && field.value ? field.value : null)
                                                    return (
                                                        <Autocomplete
                                                            freeSolo
                                                            options={brands}
                                                            getOptionLabel={(option) => (typeof option === 'string' ? option : option?.name || '')}
                                                            value={selected}
                                                            inputValue={typeof field.value === 'string' ? field.value : ''}
                                                            onInputChange={(e, newInputValue) => {
                                                                field.onChange(newInputValue)
                                                            }}
                                                            onChange={(e, newVal) => {
                                                                if(!newVal) {
                                                                    field.onChange('')
                                                                    return
                                                                }
                                                                if(typeof newVal === 'string') {
                                                                    field.onChange(newVal)
                                                                    return
                                                                }
                                                                field.onChange(newVal._id)
                                                            }}
                                                            renderInput={(params) => <TextField {...params} label="Brand" error={!!errors.brand} helperText={errors.brand?.message} />}
                                                        />
                                                    )
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth error={!!errors.category}>
                                            <InputLabel id="category-selection">Category</InputLabel>
                                            <Controller
                                                name="category"
                                                control={control}
                                                rules={{ required: "Category is required" }}
                                                render={({ field }) => (
                                                    <Select {...field} labelId="category-selection" label="Category">
                                                        {categories.map((category)=>(
                                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            {errors.category && <Typography color="error" variant="caption">{errors.category.message}</Typography>}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Stack>

                            {/* Condition */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Product Condition
                                </Typography>
                                <FormControl fullWidth error={!!errors.condition}>
                                    <InputLabel id="condition-selection">Condition</InputLabel>
                                    <Controller
                                        name="condition"
                                        control={control}
                                        rules={{ required: "Condition is required" }}
                                        render={({ field }) => (
                                            <Select {...field} labelId="condition-selection" label="Condition">
                                                <MenuItem value="New">✨ New</MenuItem>
                                                <MenuItem value="Like New">👍 Like New</MenuItem>
                                                <MenuItem value="Used - Good">📦 Used - Good</MenuItem>
                                                <MenuItem value="Used - Fair">📋 Used - Fair</MenuItem>
                                                <MenuItem value="Refurbished">🔧 Refurbished</MenuItem>
                                            </Select>
                                        )}
                                    />
                                    {errors.condition && <Typography color="error" variant="caption">{errors.condition.message}</Typography>}
                                </FormControl>
                            </Stack>

                            {/* Description */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Description
                                </Typography>
                                <TextField 
                                    fullWidth
                                    multiline 
                                    rows={4} 
                                    label="Product Description"
                                    placeholder="Enter detailed product description..."
                                    {...register("description",{required:"Description is required"})} 
                                    error={!!errors.description} 
                                    helperText={errors.description?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Stack>

                            {/* Price & Discount Row */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Pricing
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth
                                            type='number' 
                                            label="Price ($)"
                                            placeholder="0.00"
                                            {...register("price",{required:"Price is required"})} 
                                            error={!!errors.price} 
                                            helperText={errors.price?.message}
                                            inputProps={{step: "0.01"}}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth
                                            type='number' 
                                            label="Discount (%)"
                                            placeholder="0"
                                            {...register("discountPercentage",{required:"discount percentage is required"})} 
                                            error={!!errors.discountPercentage} 
                                            helperText={errors.discountPercentage?.message}
                                            inputProps={{min: "0", max: "100"}}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>

                            {/* Stock Quantity */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Stock Management
                                </Typography>
                                <TextField 
                                    fullWidth
                                    type='number' 
                                    label="Stock Quantity"
                                    placeholder="0"
                                    {...register("stockQuantity",{required:"Stock Quantity is required"})} 
                                    error={!!errors.stockQuantity} 
                                    helperText={errors.stockQuantity?.message}
                                    inputProps={{min: "0"}}
                                />
                            </Stack>

                            {/* Image Upload Section */}
                            <Stack spacing={2}>
                                <Typography variant='h6' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                    Product Images
                                </Typography>
                                
                                {/* Thumbnail */}
                                <Box sx={{
                                    border: '2px dashed #667eea',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#f9f9ff',
                                    '&:hover': {
                                        backgroundColor: '#f0f0ff',
                                        borderColor: '#764ba2'
                                    }
                                }} component="label">
                                    <Stack alignItems="center" spacing={1}>
                                        <CloudUploadIcon sx={{fontSize: '2.5rem', color: '#667eea'}} />
                                        <Stack>
                                            <Typography variant='body2' fontWeight={600} sx={{color: '#1a1a2e'}}>
                                                Click to upload thumbnail
                                            </Typography>
                                            <Typography variant='caption' sx={{color: '#666'}}>
                                                PNG, JPG or GIF (Recommended: 400x400px)
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <input type='file' accept='image/*' {...register('thumbnail')} hidden />
                                </Box>

                                {/* Product Images Grid */}
                                <Typography variant='subtitle2' fontWeight={600} sx={{color: '#1a1a2e', mt: 2}}>
                                    Product Images (Up to 4)
                                </Typography>
                                <Grid container spacing={2}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Box sx={{
                                                border: '2px dashed #e0e0e0',
                                                borderRadius: 2,
                                                p: 2,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: '#fafafa',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                    borderColor: '#667eea'
                                                }
                                            }} component="label">
                                                <Stack alignItems="center" spacing={0.5}>
                                                    <CloudUploadIcon sx={{fontSize: '1.8rem', color: '#999'}} />
                                                    <Typography variant='caption' fontWeight={600} sx={{color: '#666'}}>
                                                        Image {index + 1}
                                                    </Typography>
                                                </Stack>
                                                <input type='file' accept='image/*' {...register(`image${index}`)} hidden />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Stack>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{pt: 2}}>
                                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                    <Button 
                                        size='large' 
                                        variant='outlined' 
                                        color='error' 
                                        component={Link} 
                                        to={'/admin/dashboard'}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 3
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                    <Button 
                                        size='large' 
                                        variant='contained' 
                                        type='submit'
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 4
                                        }}
                                    >
                                        Add Product
                                    </Button>
                                </motion.div>
                            </Stack>

                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>

        </Stack>
    </Box>
  )
}
