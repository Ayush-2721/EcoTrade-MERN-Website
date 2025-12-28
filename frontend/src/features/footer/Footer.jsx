import { Box, IconButton, Typography, useMediaQuery, useTheme, Container, Divider, Grid, Link } from '@mui/material'
import { Stack } from '@mui/material'
import React from 'react'
import { MotionConfig, motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';


export const Footer = () => {

    const theme=useTheme()
    const is700=useMediaQuery(theme.breakpoints.down(700))
    const isMobile=useMediaQuery(theme.breakpoints.down('sm'))

    const linkHoverStyle = {
        color: '#4CAF50',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
            color: '#66BB6A',
            transform: 'translateX(4px)'
        }
    }

    const sectionTitleStyle = {
        fontWeight: 700,
        fontSize: isMobile ? '1rem' : '1.1rem',
        marginBottom: '1rem',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }

  return (
    <Box sx={{backgroundColor: '#1a1a2e', color: '#ecf0f1'}}>
        
        {/* Features Section (reduced vertical spacing) */}
        <Container maxWidth="lg">
            <Grid container spacing={3} sx={{py: 2}}>
                <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                            <motion.div whileHover={{scale: 1.05}}>
                            <LocalShippingIcon sx={{color: '#4CAF50', fontSize: '1.8rem'}} />
                        </motion.div>
                        <Stack>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#fff'}}>Free Shipping</Typography>
                            <Typography variant="body2" sx={{color: '#bdc3c7'}}>On orders over ₹60k</Typography>
                        </Stack>
                    </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                            <motion.div whileHover={{scale: 1.05}}>
                            <SecurityIcon sx={{color: '#4CAF50', fontSize: '1.8rem'}} />
                        </motion.div>
                        <Stack>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#fff'}}>Secure Payment</Typography>
                            <Typography variant="body2" sx={{color: '#bdc3c7'}}>100% secure transactions</Typography>
                        </Stack>
                    </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                            <motion.div whileHover={{scale: 1.05}}>
                            <SupportAgentIcon sx={{color: '#4CAF50', fontSize: '1.8rem'}} />
                        </motion.div>
                        <Stack>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#fff'}}>24/7 Support</Typography>
                            <Typography variant="body2" sx={{color: '#bdc3c7'}}>Dedicated customer care</Typography>
                        </Stack>
                    </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                            <motion.div whileHover={{scale: 1.05}}>
                            <LocalShippingIcon sx={{color: '#4CAF50', fontSize: '1.8rem'}} />
                        </motion.div>
                        <Stack>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#fff'}}>Easy Returns</Typography>
                            <Typography variant="body2" sx={{color: '#bdc3c7'}}>7-day return policy</Typography>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        </Container>

        <Divider sx={{backgroundColor: 'rgba(236, 240, 241, 0.1)'}} />

        {/* Main Footer Content (reduced vertical spacing) */}
        <Container maxWidth="lg">
            <Grid container spacing={4} sx={{py: 3}}>
                
                {/* Brand Section */}
                <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={2}>
                        <Typography variant='h6' sx={{fontSize: '1.3rem', fontWeight: 700, color: '#4CAF50'}}>
                            ♻️ EcoTrade
                        </Typography>
                        <Typography variant='body2' sx={{color: '#bdc3c7', lineHeight: 1.8}}>
                            Your trusted online shopping destination for quality products. Shop with confidence and enjoy the best deals.
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{mt: 1}}>
                            <MotionConfig whileHover={{scale: 1.3}} whileTap={{scale: 0.9}}>
                                <motion.div>
                                    <IconButton sx={{color: '#3b5998', backgroundColor: 'rgba(59, 89, 152, 0.1)', transition: 'all 0.3s ease', '&:hover': {backgroundColor: '#3b5998', color: '#fff'}}} size='small'>
                                        <FacebookIcon />
                                    </IconButton>
                                </motion.div>
                                <motion.div>
                                    <IconButton sx={{color: '#1DA1F2', backgroundColor: 'rgba(29, 161, 242, 0.1)', transition: 'all 0.3s ease', '&:hover': {backgroundColor: '#1DA1F2', color: '#fff'}}} size='small'>
                                        <TwitterIcon />
                                    </IconButton>
                                </motion.div>
                                <motion.div>
                                    <IconButton sx={{color: '#E4405F', backgroundColor: 'rgba(228, 64, 95, 0.1)', transition: 'all 0.3s ease', '&:hover': {backgroundColor: '#E4405F', color: '#fff'}}} size='small'>
                                        <InstagramIcon />
                                    </IconButton>
                                </motion.div>
                                <motion.div>
                                    <IconButton sx={{color: '#0A66C2', backgroundColor: 'rgba(10, 102, 194, 0.1)', transition: 'all 0.3s ease', '&:hover': {backgroundColor: '#0A66C2', color: '#fff'}}} size='small'>
                                        <LinkedInIcon />
                                    </IconButton>
                                </motion.div>
                            </MotionConfig>
                        </Stack>
                    </Stack>
                </Grid>

                {/* Quick Links */}
                <Grid item xs={12} sm={6} md={2.5}>
                    <Stack spacing={2}>
                        <Typography sx={sectionTitleStyle}>Quick Links</Typography>
                        <Stack spacing={1.5}>
                            <Link sx={linkHoverStyle}>Home</Link>
                            <Link sx={linkHoverStyle}>Shop All Products</Link>
                            <Link sx={linkHoverStyle}>New Arrivals</Link>
                            <Link sx={linkHoverStyle}>Best Sellers</Link>
                            <Link sx={linkHoverStyle}>Sale Items</Link>
                        </Stack>
                    </Stack>
                </Grid>

                {/* Company */}
                <Grid item xs={12} sm={6} md={2.5}>
                    <Stack spacing={2}>
                        <Typography sx={sectionTitleStyle}>Company</Typography>
                        <Stack spacing={1.5}>
                            <Link sx={linkHoverStyle}>About Us</Link>
                            <Link sx={linkHoverStyle}>Careers</Link>
                            <Link sx={linkHoverStyle}>Blog</Link>
                            <Link sx={linkHoverStyle}>Press</Link>
                            <Link sx={linkHoverStyle}>Sustainability</Link>
                        </Stack>
                    </Stack>
                </Grid>

                {/* Support */}
                <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={2}>
                        <Typography sx={sectionTitleStyle}>Contact Us</Typography>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <LocationOnIcon sx={{color: '#4CAF50', mt: 0.5, flexShrink: 0}} />
                                <Stack>
                                    <Typography variant="body2" sx={{color: '#bdc3c7', fontWeight: 500}}>Address</Typography>
                                    <Typography variant="body2" sx={{color: '#95a5a6'}}>123 Main Street, City, Country 12345</Typography>
                                </Stack>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <EmailIcon sx={{color: '#4CAF50'}} />
                                <Link href="mailto:support@mernshop.com" sx={{...linkHoverStyle, color: '#bdc3c7'}}>support@mernshop.com</Link>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <PhoneIcon sx={{color: '#4CAF50'}} />
                                <Link href="tel:+18001234567" sx={{...linkHoverStyle, color: '#bdc3c7'}}>+1-800-123-4567</Link>
                            </Stack>
                        </Stack>
                    </Stack>
                </Grid>

            </Grid>
        </Container>

        <Divider sx={{backgroundColor: 'rgba(236, 240, 241, 0.1)'}} />

        {/* Legal Links (reduced spacing) */}
        <Container maxWidth="lg">
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{py: 2, justifyContent: 'center', flexWrap: 'wrap'}}>
                <Link sx={{...linkHoverStyle, color: '#95a5a6', fontSize: '0.9rem'}}>Privacy Policy</Link>
                <Box sx={{color: '#95a5a6'}}>•</Box>
                <Link sx={{...linkHoverStyle, color: '#95a5a6', fontSize: '0.9rem'}}>Terms Of Use</Link>
                <Box sx={{color: '#95a5a6'}}>•</Box>
                <Link sx={{...linkHoverStyle, color: '#95a5a6', fontSize: '0.9rem'}}>Cookie Policy</Link>
                <Box sx={{color: '#95a5a6'}}>•</Box>
                <Link sx={{...linkHoverStyle, color: '#95a5a6', fontSize: '0.9rem'}}>FAQ</Link>
            </Stack>
        </Container>

        <Divider sx={{backgroundColor: 'rgba(236, 240, 241, 0.1)'}} />

        {/* Copyright (reduced spacing) */}
        <Container maxWidth="lg">
            <Stack alignItems="center" sx={{py: 2}}>
                <Typography variant='body2' sx={{color: '#7f8c8d', textAlign: 'center', fontSize: isMobile ? '0.8rem' : '0.9rem'}}>
                    &copy; {new Date().getFullYear()} EcoTrade. All rights reserved. | Made with <span style={{color: '#E74C3C'}}>❤️</span> for seamless shopping
                </Typography>
                <Typography variant='body2' sx={{color: '#7f8c8d', mt: 1, fontSize: '0.8rem'}}>
                    Secure Shopping | Fast Delivery | Customer Satisfaction Guaranteed
                </Typography>
            </Stack>
        </Container>

    </Box>
  )
}
