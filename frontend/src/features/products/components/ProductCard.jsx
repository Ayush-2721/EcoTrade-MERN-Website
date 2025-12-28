import { FormHelperText, Paper, Stack, Typography, useMediaQuery, useTheme, Box, Button, IconButton, Rating } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice';
import {motion} from 'framer-motion'
import { formatINR } from '../../../utils/formatCurrency'

export const ProductCard = ({id,title,price,thumbnail,brand,stockQuantity,handleAddRemoveFromWishlist,isWishlistCard,isAdminCard, rating, isDeleted, onDelete, onUnDelete}) => {


    const navigate=useNavigate()
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()
    let isProductAlreadyinWishlist=-1


    const theme=useTheme()
    const is1410=useMediaQuery(theme.breakpoints.down(1410))
    const is932=useMediaQuery(theme.breakpoints.down(932))
    const is752=useMediaQuery(theme.breakpoints.down(752))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is608=useMediaQuery(theme.breakpoints.down(608))
    const is488=useMediaQuery(theme.breakpoints.down(488))
    const is408=useMediaQuery(theme.breakpoints.down(408))

    isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)

    const handleAddToCart=async(e)=>{
        e.stopPropagation()
        const data={user:loggedInUser?._id,product:id}
        dispatch(addToCartAsync(data))
    }


        return (
        <>
        {
        isProductAlreadyinWishlist!==-1 ?
        <Paper
            component={Box}
            onClick={()=>navigate(`/product-details/${id}`)}
            elevation={2}
            sx={{
                width: is408 ? '100%' : is488 ? 200 : is608 ? 240 : is752 ? 300 : is932 ? 240 : is1410 ? 300 : 340,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 220ms ease, box-shadow 220ms ease',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(15,23,42,0.12)' },
                p: 0,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', pt: '100%', bgcolor: '#fff' }}>
                <img src={thumbnail} alt={`${title} photo unavailable`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 16, background: 'linear-gradient(180deg,#fff,#fafafa)' }} />

                {/* (price chip removed - using price in card footer) */}

                {/* wishlist heart overlay */}
                {!isAdminCard && (
                    <Box sx={{ position: 'absolute', right: 8, top: 8 }} onClick={(e)=>e.stopPropagation()}>
                        <IconButton size="small" onClick={(e)=>handleAddRemoveFromWishlist(e,id)}>
                            {isProductAlreadyinWishlist ? <Favorite sx={{ color: 'crimson' }} /> : <FavoriteBorder />}
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{brand}</Typography>
                    {!isAdminCard && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: '6px' }}>
                            <Rating name={`rating-${id}`} value={rating || 0} precision={0.1} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">{rating ? rating.toFixed(1) : ''}</Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatINR(price)}</Typography>

                    {!isWishlistCard ? (
                        isProductAlreadyInCart ? (
                            <Typography color="primary" sx={{ fontWeight: 600 }}>Added</Typography>
                        ) : (
                            !isAdminCard && (
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={(e)=>handleAddToCart(e)} style={{ padding: '8px 14px', borderRadius: 999, outline: 'none', border: 'none', cursor: 'pointer', background: '#111827', color: '#fff', fontWeight: 600 }}>
                                    Add to cart
                                </motion.button>
                            )
                        )
                    ) : <div />}
                </Box>

                {!isAdminCard && stockQuantity<=20 && (
                    <FormHelperText sx={{ fontSize: '.85rem' }} error>{stockQuantity===1?"Only 1 left":"Only a few left"}</FormHelperText>
                )}

                {/* Admin controls inside card */}
                {isAdminCard && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Button component={Link} to={`/admin/product-update/${id}`} variant='contained' size='small' onClick={(e)=>{ e.stopPropagation(); }}>
                                                    Update
                                                </Button>
                        {isDeleted ? (
                            <Button onClick={(e)=>{e.stopPropagation(); onUnDelete && onUnDelete(id)}} color='error' variant='outlined' size='small'>Un-delete</Button>
                        ) : (
                            <Button onClick={(e)=>{e.stopPropagation(); onDelete && onDelete(id)}} color='error' variant='outlined' size='small'>Delete</Button>
                        )}
                    </Box>
                )}
            </Box>
        </Paper>
        : ''
        }
        </>
    )
}
