import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductFetchStatus, selectProductFetchStatus, selectSelectedProduct } from '../ProductSlice'
import { Box,Checkbox,Rating, Stack,Typography, useMediaQuery,Button,Paper,Chip,IconButton,ButtonGroup,Divider,Modal } from '@mui/material'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { fetchReviewsByProductIdAsync,resetReviewFetchStatus,selectReviewFetchStatus,selectReviews,} from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import {toast} from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'
import { formatINR } from '../../../utils/formatCurrency'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Favorite from '@mui/icons-material/Favorite'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { useTheme } from '@mui/material'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import Lottie from 'lottie-react'
import {loadingAnimation} from '../../../assets'
import { ProductDetailsSkeleton, SkeletonGlobalStyles } from '../../../components/Skeletons/Skeletons'


const SIZES=['XS','S','M','L','XL']
const COLORS=['#020202','#F6F6F6','#B82222','#BEA9A9','#E2BB8D']
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


export const ProductDetails = () => {
    const {id}=useParams()
    const product=useSelector(selectSelectedProduct)
    const loggedInUser=useSelector(selectLoggedInUser)
    const dispatch=useDispatch()
    const cartItems=useSelector(selectCartItems)
    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    const [quantity,setQuantity]=useState(1)
    const [selectedSize,setSelectedSize]=useState('')
    const [selectedColorIndex,setSelectedColorIndex]=useState(-1)
    const reviews=useSelector(selectReviews)
    const [selectedImageIndex,setSelectedImageIndex]=useState(0)
    const [lightboxOpen,setLightboxOpen]=useState(false)
    const theme=useTheme()
    const is1420=useMediaQuery(theme.breakpoints.down(1420))
    const is990=useMediaQuery(theme.breakpoints.down(990))
    const is840=useMediaQuery(theme.breakpoints.down(840))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is480=useMediaQuery(theme.breakpoints.down(480))
    const is387=useMediaQuery(theme.breakpoints.down(387))
    const is340=useMediaQuery(theme.breakpoints.down(340))

    const wishlistItems=useSelector(selectWishlistItems)



    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)
    const isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const productFetchStatus=useSelector(selectProductFetchStatus)
    const reviewFetchStatus=useSelector(selectReviewFetchStatus)

    const totalReviewRating=reviews.reduce((acc,review)=>acc+review.rating,0)
    const totalReviews=reviews.length
    const averageRating=parseInt(Math.ceil(totalReviewRating/totalReviews))

    const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)
    
    const navigate=useNavigate()
    
    // compute condition display text (hook called at top level)
    const conditionDisplay = useMemo(() => {
        const cond = product?.condition || ''
        const extra = product?.conditionDetail || product?.conditionDetails || product?.conditionNote || product?.condition_note || product?.condition_description
        if (!cond) return ''
        if (/used/i.test(cond) && extra) return `${cond} (${extra})`
        return cond
    }, [product?.condition, product?.conditionDetail, product?.conditionDetails, product?.conditionNote, product?.condition_note, product?.condition_description])
    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])
    
    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
            dispatch(fetchReviewsByProductIdAsync(id))
        }
    },[id])

    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Error adding product to cart, please try again later')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(wishlistItemAddStatus==='fulfilled'){
            toast.success("Product added to wishlist")
        }
        else if(wishlistItemAddStatus==='rejected'){
            toast.error("Error adding product to wishlist, please try again later")
        }
    },[wishlistItemAddStatus])

    useEffect(()=>{
        if(wishlistItemDeleteStatus==='fulfilled'){
            toast.success("Product removed from wishlist")
        }
        else if(wishlistItemDeleteStatus==='rejected'){
            toast.error("Error removing product from wishlist, please try again later")
        }
    },[wishlistItemDeleteStatus])

    useEffect(()=>{
        if(productFetchStatus==='rejected'){
            toast.error("Error fetching product details, please try again later")
        }
    },[productFetchStatus])

    useEffect(()=>{
        if(reviewFetchStatus==='rejected'){
            toast.error("Error fetching product reviews, please try again later")
        }
    },[reviewFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductFetchStatus())
            dispatch(resetReviewFetchStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])

    const handleAddToCart=()=>{
        const item={user:loggedInUser._id,product:id,quantity}
        dispatch(addToCartAsync(item))
        setQuantity(1)
    }

    const handleDecreaseQty=()=>{
        if(quantity!==1){
            setQuantity(quantity-1)
        }
    }
    
    const handleIncreaseQty=()=>{
        if(quantity<20 && quantity<product.stockQuantity){
            setQuantity(quantity+1)
        }
    }

    const handleSizeSelect=(size)=>{
        setSelectedSize(size)
    }

    const handleAddRemoveFromWishlist=(e)=>{
        if(e.target.checked){
            const data={user:loggedInUser?._id,product:id}
            dispatch(createWishlistItemAsync(data))
        }

        else if(!e.target.checked){
            const index=wishlistItems.findIndex((item)=>item.product._id===id)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const imagesList = (product?.images && product.images.length>0) ? product.images : (product?.thumbnail ? [product.thumbnail] : [])
    const maxSteps = imagesList.length;

    const discount = product?.discountPercentage || 0
    const originalPrice = (product && discount>0 && product.price) ? Math.round(product.price * (1 + discount/100)) : null

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };
    // determine whether to show size/color variants based on product category
    const categoryName = product?.category?.name || ''
    const showVariants = /fashion|footwear|apparel|clothing|shoe|shoes/i.test(categoryName)
    

  return (
    <>
    {!(productFetchStatus==='rejected' && reviewFetchStatus==='rejected') && <Stack sx={{justifyContent:'center',alignItems:'center',mb:'2rem',rowGap:"2rem",pt: { xs: '5rem', md: '4.5rem' }}}>
        {
            (productFetchStatus || reviewFetchStatus) === 'pending'?
            <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <SkeletonGlobalStyles />
                <ProductDetailsSkeleton />
            </Stack>
            :
            <Stack>
                
                {/* product details */}
                <Stack sx={{ maxWidth: '1400px', width: '100%' }} p={is480?2:0} height={is840?"auto":"50rem"} rowGap={5} mt={is840?0:5} justifyContent={is840 ? 'center' : 'space-between'} mb={5} flexDirection={is840?"column":"row"} columnGap={is990?"2rem":"5rem"}>

                    {/* left stack (images) */}
                    <Stack  sx={{flex: 1, flexDirection:"row",columnGap:"2.5rem",alignSelf:"flex-start",height:"100%", minWidth: is480 ? '260px' : '380px'}}>

                        {/* image selection */}
                        {!is1420 && <Stack sx={{display:"flex",rowGap:'1rem',height:"100%",overflowY:"auto", pr:1}}>
                            {
                                product && product.images.map((image,index)=>(
                                    <motion.div  whileHover={{scale:1.05}} whileTap={{scale:1}} key={index} style={{width: is480? '56px' : '80px', cursor:"pointer"}} onClick={()=>setSelectedImageIndex(index)}>
                                        <img style={{width:"100%",height: is480?56:80, objectFit:"cover", borderRadius:6}} src={image} alt={`${product.title} image`} />
                                    </motion.div>
                                ))
                            }
                        </Stack>}
                        
                        {/* selected image */}
                        <Stack mt={is480?"0rem":'2rem'} sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                            {
                                is1420?
                                <Stack width={is480?"100%":is990?'400px':"500px"} >
                                    <AutoPlaySwipeableViews width={'100%'} height={'100%'} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents >
                                        {
                                        imagesList.map((image,index) => (
                                        <div key={index} style={{width:"100%",height:'100%'}}>
                                            {
                                            Math.abs(activeStep - index) <= 2 
                                                ?
                                                <Box component="img" sx={{width:'100%',objectFit:"contain",overflow:"hidden",aspectRatio:1/1}} src={image} alt={product?.title} />
                                                :
                                                null
                                            }
                                        </div>
                                        ))
                                        }
                                    </AutoPlaySwipeableViews>

                                    <MobileStepper steps={maxSteps} position="static" activeStep={activeStep} nextButton={<Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} >Next{theme.direction === 'rtl' ? (<KeyboardArrowLeft />) : (<KeyboardArrowRight />)}</Button>} backButton={<Button size="small" onClick={handleBack} disabled={activeStep === 0}>{theme.direction === 'rtl' ? (<KeyboardArrowRight />) : (<KeyboardArrowLeft />)}Back</Button>}/>
                                </Stack>
                                :
                                <div style={{width:"100%", display:'flex', justifyContent:'center'}}>
                                    <img
                                        style={{
                                            width: '100%',
                                            maxWidth: is1420 ? (is480 ? '320px' : '520px') : '720px',
                                            objectFit: 'contain',
                                            aspectRatio: '1/1',
                                            borderRadius: 8
                                        }}
                                        src={imagesList[selectedImageIndex]}
                                        alt={`${product?.title} image`}
                                        onClick={()=>setLightboxOpen(true)}
                                    />
                                </div>
                            }
                        </Stack>

                    </Stack>

                    {/* right stack - about product */}
                    <Stack rowGap={"1.5rem"} width={is480?"100%":'44rem'} sx={{position: 'relative', paddingRight: is480? 0 : 16}}>

                        {/* title, rating, price */}
                        <Stack rowGap={".5rem"}>
                            <Typography variant='h4' fontWeight={800} sx={{fontSize: is480 ? '1.25rem' : '1.75rem'}}>{product?.title}</Typography>

                            {product?.condition && (
                                <Typography variant='subtitle2' color='text.secondary'>{conditionDisplay}</Typography>
                            )}

                            <Stack sx={{display:'flex',flexDirection:'row',alignItems:'center',gap:2,flexWrap:'wrap'}}>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                    <Rating value={averageRating} readOnly size='small' />
                                    <Typography variant='caption' color='text.secondary' sx={{ml:0.5}}>{totalReviews===0?"No reviews":totalReviews===1?`${totalReviews} Review`:`${totalReviews} Reviews`}</Typography>
                                </Stack>
                                <Chip label={product?.stockQuantity<=10?`Only ${product?.stockQuantity} left`:(product?.stockQuantity<=20?`Limited stock`:'In stock')} color={product?.stockQuantity<=10? 'error':'default'} size='small' />
                            </Stack>

                            <Box sx={{display:'flex',alignItems:'center',gap:2}}>
                                <Typography variant='h5' sx={{fontWeight:800}}>{formatINR(product?.price)}</Typography>
                                {discount>0 && (
                                    <>
                                        <Typography variant='body2' sx={{textDecoration:'line-through',color:'text.secondary'}}>{formatINR(originalPrice)}</Typography>
                                        <Chip label={`-${discount}%`} color='secondary' size='small' />
                                    </>
                                )}
                            </Box>
                        </Stack>

                        {/* description moved down below add-to-cart for better UX */}
                        

                        {/* color, size and add-to-cart */}

                        {
                            !loggedInUser?.isAdmin &&

                        <Paper elevation={2} sx={{p:2,borderRadius:3,background:'#fff',boxShadow:'0 8px 30px rgba(15,23,42,0.08)', position: is480? 'relative' : 'sticky', top: is480? '0px' : '90px'}}>
                        <Stack sx={{rowGap:"1.3rem"}} width={'100%'}>

                            {/* colors (only for applicable categories) */}
                            {showVariants && (
                                <Stack flexDirection={'row'} alignItems={'center'} columnGap={is387?'5px':'1rem'} width={'fit-content'}>
                                    <Typography>Colors: </Typography>
                                    <Stack flexDirection={'row'} columnGap={is387?".5rem":".2rem"} >
                                        {
                                            COLORS.map((color,index)=>(
                                                <div key={color+index} style={{backgroundColor:"white",border:selectedColorIndex===index?`1px solid ${theme.palette.primary.dark}`:"",width:is340?"40px":"50px",height:is340?"40px":"50px",display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"100%",}}>
                                                    <div onClick={()=>setSelectedColorIndex(index)} style={{width:"40px",height:"40px",border:color==='#F6F6F6'?"1px solid grayText":"",backgroundColor:color,borderRadius:"100%"}}></div>
                                                </div>
                                            ))
                                        }
                                    </Stack>
                                </Stack>
                            )}

                            {/* size (only for applicable categories) */}
                            {showVariants && (
                                <Stack flexDirection={'row'} alignItems={'center'} columnGap={is387?'5px':'1rem'} width={'fit-content'}>
                                    <Typography>Size: </Typography>
                                    <Stack flexDirection={'row'} columnGap={is387?".5rem":"1rem"}>
                                        {
                                            SIZES.map((size)=>(
                                                <motion.div key={size} onClick={()=>handleSizeSelect(size)} whileHover={{scale:1.050}} whileTap={{scale:1}} style={{border:selectedSize===size?'':"1px solid grayText",borderRadius:"8px",width:"30px",height:"30px",display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",padding:"1.2rem",backgroundColor:selectedSize===size?"#DB4444":"whitesmoke",color:selectedSize===size?"white":""}}>
                                                    <p>{size}</p>
                                                </motion.div>
                                            ))
                                        }
                                    </Stack>
                                </Stack>
                            )}

                            {/* quantity , add to cart and wishlist */}
                            <Stack flexDirection={"row"} columnGap={is387?".3rem":"1.5rem"} width={'100%'} alignItems='center'>
                                
                                {/* qunatity */}
                                <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                                    
                                    <ButtonGroup variant='outlined' size='medium' aria-label='quantity group'>
                                        <Button onClick={handleDecreaseQty} disabled={quantity===1}>-</Button>
                                        <Button disabled sx={{pointerEvents:'none'}}>{quantity}</Button>
                                        <Button onClick={handleIncreaseQty} disabled={quantity>=20 || (product && quantity>=product.stockQuantity)}>+</Button>
                                    </ButtonGroup>

                                </Stack>
                                
                                {/* add to cart */}
                                {
                                    isProductAlreadyInCart?
                                    <Button variant='contained' color='primary' onClick={()=>navigate('/cart')}>In Cart</Button>
                                    :<Button variant='contained' color='primary' onClick={handleAddToCart}>Add to cart</Button>
                                }

                                {/* wishlist */}
                                <Box>
                                    <IconButton onClick={(e)=>handleAddRemoveFromWishlist(e)} color={isProductAlreadyinWishlist? 'error':'default'}>
                                        {isProductAlreadyinWishlist ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                </Box>


                            </Stack>

                        </Stack>
                        </Paper>
                        
                        }


                        {/* product perks */}
                        {/* description (placed after add-to-cart controls) */}
                        <Stack rowGap={".8rem"}>
                            <Typography variant='body1' color='text.secondary'>{product?.description}</Typography>
                            <Divider />
                        </Stack>

                        <Paper elevation={0} sx={{mt:2,borderRadius:2,border:'1px solid rgba(0,0,0,0.06)'}}>
                            <Stack mt={1} sx={{p:2}}>
                                <Stack flexDirection='row' gap={2} alignItems='center'>
                                    <LocalShippingOutlinedIcon />
                                    <Stack>
                                        <Typography variant='subtitle2'>Free Delivery</Typography>
                                        <Typography variant='caption' color='text.secondary'>Enter your postal for delivery availability</Typography>
                                    </Stack>
                                </Stack>
                                <Divider sx={{my:1}} />
                                <Stack flexDirection='row' gap={2} alignItems='center'>
                                    <CachedOutlinedIcon />
                                    <Stack>
                                        <Typography variant='subtitle2'>Return Delivery</Typography>
                                        <Typography variant='caption' color='text.secondary'>Free 30 Days Delivery Returns</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Paper>

                    </Stack>
                    
                </Stack>

                {/* reviews */}
                <Stack width={is1420?"auto":'88rem'} p={is480?2:0} mt={is840?2:6}>
                    <Reviews productId={id} averageRating={averageRating}/>       
                </Stack>
            
            </Stack>
        }
                
    </Stack>
    }
    </>

  )
}
