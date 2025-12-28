import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';



export const Navbar=({isProductList=false})=> {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  
  const userInfo=useSelector(selectUserInfo)
  const cartItems=useSelector(selectCartItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const theme=useTheme()
  const is480=useMediaQuery(theme.breakpoints.down(480))
  const isMd=useMediaQuery(theme.breakpoints.down('md'))

  const wishlistItems=useSelector(selectWishlistItems)
  const isProductFilterOpen=useSelector(selectProductIsFilterOpen)

  // Hide navbar on scroll down, show on scroll up
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        // Only hide/show if scrolled more than 100px to avoid jitter at top
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        // Always visible at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters=()=>{
    dispatch(toggleFilters())
  }

  const navButtons = [
    {name:"Home",to:"/"},
    {name:'Profile',to:loggedInUser?.isAdmin?"/admin/profile":"/profile"},
    {name:loggedInUser?.isAdmin?'Orders':'My Order',to:loggedInUser?.isAdmin?"/admin/orders":"/orders"},
  ];

  const settings = [
    {name:"Home",to:"/"},
    {name:'Profile',to:loggedInUser?.isAdmin?"/admin/profile":"/profile"},
    {name:loggedInUser?.isAdmin?'Orders':'My orders',to:loggedInUser?.isAdmin?"/admin/orders":"/orders"},
    {name:'Logout',to:"/logout"},
  ];

  return (
    <>
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor:"white",
        boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
        color:"text.primary",
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1100
      }}
    >
        <Toolbar sx={{p:1,height:"4rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>

          <Typography variant="h6" noWrap component="a" href="/" sx={{ fontWeight: 700, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none', fontSize: isMd ? '1rem' : '1.3rem' }}>
            ♻️ EcoTrade
          </Typography>

          {/* Desktop Navigation Buttons */}
          {!isMd && (
            <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
              {navButtons.map((btn) => (
                <Button
                  key={btn.name}
                  component={Link}
                  to={btn.to}
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: 0,
                    borderRadius: '6px',
                    color: 'text.primary',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: '#7c3aed', background: 'transparent' }
                  }}
                >
                  {btn.name}
                </Button>
              ))}
            </Stack>
          )}

          <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={userInfo?.name} src={userInfo?.avatar || ''} sx={{width: 40, height: 40}} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >

              {
                loggedInUser?.isAdmin && 
              
                <MenuItem  onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none"}} to="/admin/add-product" textAlign="center">Add new Product</Typography>
                </MenuItem>
              
              }
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <Typography 
                    component={Link} 
                    color={'text.primary'} 
                    sx={{
                      textDecoration:"none",
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#7c3aed'
                      }
                    }} 
                    to={setting.to} 
                    textAlign="center"
                  >
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <Typography variant='body2' fontWeight={400} sx={{display: is480 ? 'none' : 'block'}}>
              {is480?`${userInfo?.name?.toString().split(" ")[0]}`:`Welcome, ${userInfo?.name?.split(" ")[0] || 'Guest'}`}
            </Typography>
            {loggedInUser?.isAdmin && <Chip label='Admin' color='success' size='small' variant='outlined'/>}

            {/* Admin-only: Buyer Chats */}
            {loggedInUser?.isAdmin && (
              <Button
                component={Link}
                to={'/admin/chats'}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', borderColor: '#4CAF50', color: '#4CAF50', '&:hover': { backgroundColor: '#f1f8f3' } }}
              >
                Buyer Chats
              </Button>
            )}
            <Stack sx={{flexDirection:"row",columnGap:"1rem",alignItems:"center",justifyContent:"center"}}>

            {/* Chat with Admin button - visible only to logged-in buyers */}
            {loggedInUser && !loggedInUser?.isAdmin && (
              <Button
                component={Link}
                to={'/chat/admin'}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)', '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' } }}
              >
                Chat with Admin
              </Button>
            )}

            
            {
            cartItems?.length>0 && 
            <Badge  badgeContent={cartItems.length} color='error'>
              <IconButton onClick={()=>navigate("/cart")} sx={{transition: 'all 0.3s ease', '&:hover': {color: '#4CAF50'}}}>
                <ShoppingCartOutlinedIcon />
                </IconButton>
            </Badge>
            }
            
            {
              !loggedInUser?.isAdmin &&
                  <Stack>
                      <Badge badgeContent={wishlistItems?.length} color='error'>
                          <IconButton component={Link} to={"/wishlist"} sx={{transition: 'all 0.3s ease', '&:hover': {color: '#4CAF50'}}}><FavoriteBorderIcon /></IconButton>
                      </Badge>
                  </Stack>
            }
            {
              isProductList && <IconButton onClick={handleToggleFilters} sx={{transition: 'all 0.3s ease', '&:hover': {color: '#4CAF50'}}}><TuneIcon sx={{color:isProductFilterOpen?"#4CAF50":""}}/></IconButton>
            }
            
            </Stack>
          </Stack>
        </Toolbar>
    </AppBar>
    {/* Spacer to offset the fixed AppBar so page content isn't overlapped */}
    <Toolbar sx={{ minHeight: '4rem' }} />
    </>
  );
}