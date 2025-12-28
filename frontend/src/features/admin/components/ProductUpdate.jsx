import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync,resetProductUpdateStatus, selectProductUpdateStatus, selectSelectedProduct, updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme, Grid, Paper, Box } from '@mui/material'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'

export const ProductUpdate = () => {

    const {register,handleSubmit,watch,formState: { errors }, reset} = useForm()

    const {id}=useParams()
    const dispatch=useDispatch()
    const selectedProduct=useSelector(selectSelectedProduct)
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const productUpdateStatus=useSelector(selectProductUpdateStatus)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))


    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
        }
    },[id])

    useEffect(()=>{
        // correct status value check (slice sets 'fulfilled')
        if(productUpdateStatus==='fulfilled'){
            toast.success("Product Updated")
            navigate("/admin/dashboard")
        }
        else if(productUpdateStatus==='rejected'){
            toast.error("Error updating product, please try again later")
        }
    },[productUpdateStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductUpdateStatus())
        }
    },[])

    // when selectedProduct loads, populate the form with its values
    useEffect(()=>{
        if (!selectedProduct) return
        const vals = {
            title: selectedProduct.title || '',
            brand: selectedProduct.brand?._id || selectedProduct.brand || '',
            category: selectedProduct.category?._id || selectedProduct.category || '',
            description: selectedProduct.description || '',
            price: selectedProduct.price || 0,
            discountPercentage: selectedProduct.discountPercentage || 0,
            stockQuantity: selectedProduct.stockQuantity || 0,
            thumbnail: selectedProduct.thumbnail || ''
        }
        ;(selectedProduct.images || []).forEach((img, idx) => { vals[`image${idx}`] = img })
        reset(vals)
    },[selectedProduct, reset])

    const handleProductUpdate=(data)=>{
        const productUpdate={...data,_id:selectedProduct._id,images:[data?.image0,data?.image1,data?.image2,data?.image3]}
        delete productUpdate?.image0
        delete productUpdate?.image1
        delete productUpdate?.image2
        delete productUpdate?.image3

        dispatch(updateProductByIdAsync(productUpdate))
    }


  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} sx={{pt: { xs: '5rem', md: '4.5rem' }}}>
        {
            selectedProduct &&
            <Paper sx={{ width: is1100? '100%':'80%', maxWidth: '1100px', p: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={2}>
                <Box component={'form'} noValidate onSubmit={handleSubmit(handleProductUpdate)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={7}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant='subtitle1' gutterBottom>Title</Typography>
                                    <TextField fullWidth {...register("title",{required:'Title is required',value:selectedProduct.title})}/>
                                </Box>

                                <Box>
                                    <Typography variant='subtitle1' gutterBottom>Description</Typography>
                                    <TextField fullWidth multiline rows={5} {...register("description",{required:"Description is required",value:selectedProduct.description})}/>
                                </Box>

                                <Box>
                                    <Typography variant='subtitle1' gutterBottom>Product Images</Typography>
                                    <Stack spacing={1}>
                                        {
                                            (selectedProduct.images || []).map((image,index)=>(
                                                <TextField key={index} fullWidth {...register(`image${index}`,{required:"Image is required",value:image})}/>
                                            ))
                                        }
                                    </Stack>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Stack spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="brand-selection">Brand</InputLabel>
                                    <Select defaultValue={selectedProduct.brand?._id || ''} {...register("brand",{required:"Brand is required"})} labelId="brand-selection" label="Brand">
                                        { brands.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>) }
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel id="category-selection">Category</InputLabel>
                                    <Select defaultValue={selectedProduct.category?._id || selectedProduct.category || ''} {...register("category",{required:"category is required"})} labelId="category-selection" label="Category">
                                        { categories.map(category => (typeof category === 'string' ? <MenuItem key={category} value={category}>{category}</MenuItem> : <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>)) }
                                    </Select>
                                </FormControl>

                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant='subtitle2'>Price</Typography>
                                        <TextField fullWidth type='number' {...register("price",{required:"Price is required",value:selectedProduct.price})}/>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant='subtitle2'>Discount %</Typography>
                                        <TextField fullWidth type='number' {...register("discountPercentage",{required:"discount percentage is required",value:selectedProduct.discountPercentage})}/>
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography variant='subtitle2'>Stock Quantity</Typography>
                                    <TextField fullWidth type='number' {...register("stockQuantity",{required:"Stock Quantity is required",value:selectedProduct.stockQuantity})}/>
                                </Box>

                                <Box>
                                    <Typography variant='subtitle2'>Thumbnail</Typography>
                                    <TextField fullWidth {...register("thumbnail",{required:"Thumbnail is required",value:selectedProduct.thumbnail})}/>
                                </Box>

                                <Box sx={{display:'flex', justifyContent:'flex-end', gap:2, mt:1}}>
                                    <Button size={is480?'medium':'large'} variant='outlined' color='error' component={Link} to={'/admin/dashboard'}>Cancel</Button>
                                    <Button size={is480?'medium':'large'} variant='contained' type='submit'>Update</Button>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        }
    </Stack>
  )
}
