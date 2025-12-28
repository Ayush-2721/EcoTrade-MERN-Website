import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderByUserIdAsync, resetOrderFetchStatus, selectOrderFetchStatus, selectOrders } from '../OrderSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme, Box, Card, CardContent, Grid, Chip, Divider, CardActions } from '@mui/material'
import {Link} from 'react-router-dom'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import Lottie from 'lottie-react'
import { loadingAnimation, noOrdersAnimation } from '../../../assets'
import { OrdersSkeleton, SkeletonGlobalStyles } from '../../../components/Skeletons/Skeletons'
import { toast } from 'react-toastify'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {motion} from 'framer-motion'
import { formatINR } from '../../../utils/formatCurrency'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';


export const UserOrders = () => {

    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const orders=useSelector(selectOrders)
    // show newest orders first
    const sortedOrders = (orders && orders.length) ? [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
    const cartItems=useSelector(selectCartItems)
    const orderFetchStatus=useSelector(selectOrderFetchStatus)

    const theme=useTheme()
    const is1200=useMediaQuery(theme.breakpoints.down("1200"))
    const is768=useMediaQuery(theme.breakpoints.down("768"))
    const is660=useMediaQuery(theme.breakpoints.down(660))
    const is480=useMediaQuery(theme.breakpoints.down("480"))

    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    
    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        dispatch(getOrderByUserIdAsync(loggedInUser?._id))
    },[dispatch])


    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Error adding product to cart, please try again later')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(orderFetchStatus==='rejected'){
            toast.error("Error fetching orders, please try again later")
        }
    },[orderFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetOrderFetchStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])


    const handleAddToCart=(product)=>{
        const item={user:loggedInUser._id,product:product._id,quantity:1}
        dispatch(addToCartAsync(item))
    }


  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return '#4CAF50'
      case 'pending': return '#FF9800'
      case 'shipped': return '#2196F3'
      case 'cancelled': return '#F44336'
      default: return '#757575'
    }
  }

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return <CheckCircleIcon sx={{fontSize: '1.2rem'}} />
      case 'pending': return <PendingIcon sx={{fontSize: '1.2rem'}} />
      case 'shipped': return <LocalShippingIcon sx={{fontSize: '1.2rem'}} />
      case 'cancelled': return <CancelIcon sx={{fontSize: '1.2rem'}} />
      default: return null
    }
  }

  return (
    <Box sx={{minHeight: '100vh', backgroundColor: '#f5f7fa', py: 4, pt: { xs: '5rem', md: '4.5rem' }}}>
        {
            orderFetchStatus==='pending'?
            <Stack width={is480?'auto':'100%'} justifyContent={'center'} alignItems={'center'} sx={{p:2}}>
                <SkeletonGlobalStyles />
                <OrdersSkeleton rows={4} />
            </Stack>
            :
            <Stack maxWidth="1200px" margin="0 auto" spacing={4} px={is480 ? 2 : 0}>
                
                {/* Header Section */}
                <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            {!is480 && (
                                <motion.div whileHover={{x: -5}}>
                                    <IconButton component={Link} to={"/"} sx={{color: '#667eea'}}>
                                        <ArrowBackIcon fontSize='large'/>
                                    </IconButton>
                                </motion.div>
                            )}
                            <Stack spacing={1}>
                                <Typography variant='h4' fontWeight={700} sx={{color: '#1a1a2e'}}>
                                    Order History
                                </Typography>
                                <Typography sx={{color: '#666', maxWidth: '500px'}}>
                                    Check the status of recent orders, manage returns, and discover similar products.
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </motion.div>

                {/* Orders Grid */}
                {orders && orders.length > 0 ? (
                    <Stack spacing={3}>
                        {sortedOrders.map((order, index) => (
                            <motion.div 
                                key={order._id}
                                initial={{opacity: 0, y: 20}} 
                                animate={{opacity: 1, y: 0}} 
                                transition={{duration: 0.5, delay: index * 0.1}}
                            >
                                <Card 
                                    elevation={0} 
                                    sx={{
                                        background: '#ffffff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                >
                                    {/* Order Header */}
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        px: 3,
                                        py: 2.5
                                    }}>
                                        <Grid container spacing={3} alignItems="center">
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" sx={{opacity: 0.9, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600}}>
                                                        Order Number
                                                    </Typography>
                                                    <Typography variant="body2" sx={{fontFamily: 'monospace', fontSize: '0.9rem'}}>
                                                        {order._id?.substring(0, 12)}...
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <Stack spacing={0.5}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CalendarTodayIcon sx={{fontSize: '1rem'}} />
                                                        <Typography variant="body2" sx={{opacity: 0.9, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600}}>
                                                            Date
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="body2">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <Stack spacing={0.5}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <ShoppingBagIcon sx={{fontSize: '1rem'}} />
                                                        <Typography variant="body2" sx={{opacity: 0.9, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600}}>
                                                            Items
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="body2">
                                                        {order.item.length} {order.item.length === 1 ? 'item' : 'items'}
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" sx={{opacity: 0.9, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600}}>
                                                        Total
                                                    </Typography>
                                                    <Typography variant="h6" sx={{fontWeight: 700}}>
                                                        {formatINR(order.total)}
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={3}>
                                                <Chip 
                                                    icon={getStatusIcon(order.status)}
                                                    label={order.status?.toUpperCase() || 'UNKNOWN'}
                                                    sx={{
                                                        backgroundColor: getStatusColor(order.status),
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        width: '100%',
                                                        height: '40px',
                                                        fontSize: '0.9rem',
                                                        '& .MuiChip-icon': {
                                                            color: '#fff !important'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Order Items */}
                                    <CardContent sx={{pt: 3, pb: 0}}>
                                        <Stack spacing={3}>
                                            {order.item.map((product, itemIndex) => (
                                                <motion.div
                                                    key={itemIndex}
                                                    initial={{opacity: 0}} 
                                                    animate={{opacity: 1}} 
                                                    transition={{delay: itemIndex * 0.1}}
                                                >
                                                    <Stack spacing={2}>
                                                        <Grid container spacing={2}>
                                                            {/* Product Image */}
                                                            <Grid item xs={12} sm={4} md={3}>
                                                                <Box
                                                                    sx={{
                                                                        position: 'relative',
                                                                        borderRadius: 2,
                                                                        overflow: 'hidden',
                                                                        backgroundColor: '#f5f5f5',
                                                                        aspectRatio: '1/1',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <img 
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'contain',
                                                                            padding: '1rem'
                                                                        }} 
                                                                        src={
                                                                            (product.product?.images && product.product.images.length > 0 && product.product.images[0]) || 
                                                                            product.product?.thumbnail || 
                                                                            '/favicon.ico'
                                                                        } 
                                                                        alt={product.product?.title || 'product image'} 
                                                                    />
                                                                </Box>
                                                            </Grid>

                                                            {/* Product Info */}
                                                            <Grid item xs={12} sm={8} md={9}>
                                                                <Stack spacing={2} height="100%">
                                                                    <Stack spacing={1}>
                                                                        <Typography variant='h6' sx={{fontWeight: 600, color: '#1a1a2e'}}>
                                                                            {product.product?.title}
                                                                        </Typography>
                                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                                            <Typography variant='body2' sx={{color: '#666'}}>
                                                                                {product.product?.brand?.name || 'Brand Unknown'}
                                                                            </Typography>
                                                                            <Typography variant='body2' sx={{color: '#999'}}>
                                                                                •
                                                                            </Typography>
                                                                            <Typography variant='body2' sx={{color: '#666'}}>
                                                                                Qty: {product.quantity}
                                                                            </Typography>
                                                                        </Stack>
                                                                    </Stack>

                                                                    <Typography variant='body2' sx={{color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                                                        {product.product?.description}
                                                                    </Typography>

                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                                                                        <Typography variant='h6' sx={{fontWeight: 700, color: '#667eea'}}>
                                                                            ₹{product.product?.price}
                                                                        </Typography>
                                                                        <Stack direction="row" spacing={1}>
                                                                            <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                                                                <Button 
                                                                                    size='small' 
                                                                                    component={Link} 
                                                                                    to={`/product-details/${product.product?._id}`} 
                                                                                    variant='outlined'
                                                                                    sx={{textTransform: 'none', fontWeight: 600}}
                                                                                >
                                                                                    View Product
                                                                                </Button>
                                                                            </motion.div>
                                                                            <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                                                                {cartItems.some((cartItem) => cartItem.product?._id === product.product?._id) ? (
                                                                                    <Button 
                                                                                        size='small' 
                                                                                        variant='contained' 
                                                                                        component={Link} 
                                                                                        to={"/cart"}
                                                                                        sx={{
                                                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                            textTransform: 'none',
                                                                                            fontWeight: 600
                                                                                        }}
                                                                                    >
                                                                                        In Cart
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button 
                                                                                        size='small' 
                                                                                        variant='contained' 
                                                                                        onClick={() => handleAddToCart(product.product)}
                                                                                        sx={{
                                                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                            textTransform: 'none',
                                                                                            fontWeight: 600
                                                                                        }}
                                                                                    >
                                                                                        Buy Again
                                                                                    </Button>
                                                                                )}
                                                                            </motion.div>
                                                                        </Stack>
                                                                    </Stack>
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>
                                                        {itemIndex < order.item.length - 1 && <Divider />}
                                                    </Stack>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </Stack>
                ) : (
                    /* No Orders State */
                    !orders.length && (
                        <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.5}}>
                            <Stack mt={4} mb={8} alignSelf={'center'} rowGap={3} alignItems="center">
                                <Box width={is660 ? "auto" : "30rem"} height={is660 ? "auto" : "30rem"}>
                                    <Lottie animationData={noOrdersAnimation}/>
                                </Box>
                                <Typography textAlign={'center'} variant='h6' sx={{color: '#666', maxWidth: '400px'}}>
                                    Oh! Looks like you haven't placed any orders yet. Start shopping now!
                                </Typography>
                                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                    <Button 
                                        component={Link} 
                                        to="/" 
                                        variant='contained'
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 1.5,
                                            px: 4
                                        }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </motion.div>
                            </Stack>
                        </motion.div>
                    )
                )}
            </Stack>
        }
    </Box>
  )
}
