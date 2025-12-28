import { Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Stack, Typography, useMediaQuery, useTheme, Box, TextField, Paper, Avatar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import { selectBrands } from '../../brands/BrandSlice'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import { ProductCard } from '../../products/components/ProductCard'
import { deleteProductByIdAsync, fetchProductsAsync, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters, undeleteProductByIdAsync } from '../../products/ProductSlice';
import { selectProductFetchStatus } from '../../products/ProductSlice'
import { ProductListSkeleton, SkeletonGlobalStyles, DashboardSkeleton } from '../../../components/Skeletons/Skeletons'
import { Link } from 'react-router-dom';
import {motion} from 'framer-motion'
import ClearIcon from '@mui/icons-material/Clear';
import { ITEMS_PER_PAGE } from '../../../constants';

const sortOptions=[
    {name:"Price: low to high",sort:"price",order:"asc"},
    {name:"Price: high to low",sort:"price",order:"desc"},
]

export const AdminDashBoard = () => {

    const [filters,setFilters]=useState({})
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const [sort,setSort]=useState(null)
    const [page,setPage]=useState(1)
    const products=useSelector(selectProducts)
    const dispatch=useDispatch()
    const theme=useTheme()
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const isProductFilterOpen=useSelector(selectProductIsFilterOpen)
    const totalResults=useSelector(selectProductTotalResults)
    
    const is1200=useMediaQuery(theme.breakpoints.down(1200))
    const is800=useMediaQuery(theme.breakpoints.down(800))
    const is700=useMediaQuery(theme.breakpoints.down(700))
    const is600=useMediaQuery(theme.breakpoints.down(600))
    const is488=useMediaQuery(theme.breakpoints.down(488))

    const productFetchStatus = useSelector(selectProductFetchStatus)
    const [search, setSearch] = useState('')
    const [filterMode, setFilterMode] = useState('all') // values: 'all' | 'deleted' | 'lowstock'

    useEffect(()=>{
        setPage(1)
    },[totalResults])

    const totalProducts = products?.length || 0
    const deletedCount = (products || []).filter(p => p.isDeleted).length
    const lowStockCount = (products || []).filter(p => (p.stockQuantity || 0) <= 5).length

    const displayedProducts = (products || []).filter(p => {
        if (filterMode === 'deleted' && !p.isDeleted) return false
        if (filterMode === 'lowstock' && ((p.stockQuantity || 0) > 5)) return false
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    useEffect(()=>{
        const finalFilters={...filters}

        finalFilters['pagination']={page:page,limit:ITEMS_PER_PAGE}
        finalFilters['sort']=sort

        dispatch(fetchProductsAsync(finalFilters))
        
    },[filters,sort,page])

    const handleBrandFilters=(e)=>{

        const filterSet=new Set(filters.brand)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,brand:filterArray})
    }

    const handleCategoryFilters=(e)=>{
        const filterSet=new Set(filters.category)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,category:filterArray})
    }

    const handleProductDelete=(productId)=>{
        dispatch(deleteProductByIdAsync(productId))
    }

    const handleProductUnDelete=(productId)=>{
        dispatch(undeleteProductByIdAsync(productId))
    }

    const handleFilterClose=()=>{
        dispatch(toggleFilters())
    }

  return (
    <>

    <motion.div style={{
        position:"fixed",
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        height:"100vh",
        padding:'1rem',
        overflowY:"scroll",
        width:is500?"100vw":"30rem",
        zIndex:500,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
    }}  variants={{show:{left:0},hide:{left:-500}}} initial={'hide'} transition={{ease:"easeInOut",duration:.7,type:"spring"}} animate={isProductFilterOpen===true?"show":"hide"}>

        {/* fitlers section */}
        <Stack mb={'5rem'}  sx={{scrollBehavior:"smooth",overflowY:"scroll"}}>

        
            <Typography variant='h4'>New Arrivals</Typography>


                <IconButton onClick={handleFilterClose} style={{position:"absolute",top:15,right:15}}>
                    <motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
                        <ClearIcon fontSize='medium'/>
                    </motion.div>
                </IconButton>


        {/* Removed static quick-links (Totes, Backpacks, Travel Bags, Hip Bags, Laptop Sleeves) per request */}

        {/* brand filters */}
        <Stack mt={2}>
            <Accordion>
                <AccordionSummary expandIcon={<AddIcon />}  aria-controls="brand-filters" id="brand-filters" >
                        <Typography>Brands</Typography>
                </AccordionSummary>

                <AccordionDetails sx={{p:0}}>
                    <FormGroup onChange={handleBrandFilters}>
                        {
                            (brands || []).filter(Boolean).map((brand)=>(
                                <motion.div key={brand?._id || brand?.name || ''} style={{width:"fit-content"}} whileHover={{x:5}} whileTap={{scale:0.9}}>
                                    <FormControlLabel sx={{ml:1}} control={<Checkbox whileHover={{scale:1.1}} />} label={brand?.name || ''} value={brand._id} />
                                </motion.div>
                            ))
                        }
                    </FormGroup>
                </AccordionDetails>
            </Accordion>
        </Stack>

        {/* category filters */}
        <Stack mt={2}>
            <Accordion>
                <AccordionSummary expandIcon={<AddIcon />}  aria-controls="brand-filters" id="brand-filters" >
                        <Typography>Category</Typography>
                </AccordionSummary>

                <AccordionDetails sx={{p:0}}>
                    <FormGroup onChange={handleCategoryFilters}>
                        {
                            (categories || []).filter(Boolean).map((category)=>(
                                <motion.div key={category?._id || category?.name || ''} style={{width:"fit-content"}} whileHover={{x:5}} whileTap={{scale:0.9}}>
                                    <FormControlLabel sx={{ml:1}} control={<Checkbox whileHover={{scale:1.1}} />} label={category?.name || ''} value={category._id} />
                                </motion.div>
                            ))
                        }
                    </FormGroup>
                </AccordionDetails>
            </Accordion>
        </Stack>
</Stack>

    </motion.div>

        <Stack rowGap={4} mt={is600?1:2} mb={'3rem'} sx={{
        background: 'linear-gradient(180deg, #fbfdff 0%, #f1f7ff 100%)',
        minHeight: '100vh',
        px: is600 ? 2 : 5,
        py: 4,
        position: 'relative'
    }}>

        {/* Header */}
        <Stack direction={'row'} spacing={2} mt={2} alignItems='flex-start' justifyContent='space-between'>
            <Stack>
                <Typography variant='h4' sx={{fontWeight:700}}>Admin Dashboard</Typography>
                <Typography color='text.secondary' sx={{mt:1}}>Manage products and listings</Typography>
            </Stack>
            <Stack direction={'row'} spacing={2} alignItems='center'>
                <FormControl variant='standard' sx={{minWidth:140}}>
                    <InputLabel id="sort-dropdown">Sort</InputLabel>
                    <Select
                        variant='standard'
                        labelId="sort-dropdown"
                        label="Sort"
                        onChange={(e)=>setSort(e.target.value)}
                        value={sort}
                    >
                        <MenuItem bgcolor='text.secondary' value={null}>Reset</MenuItem>
                        {
                            sortOptions.map((option)=>(
                                <MenuItem key={option.name} value={option}>{option.name}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Stack>
        </Stack>

        <Stack direction={'row'} spacing={2} mt={2}>
            <Paper onClick={()=>{ setFilterMode('all'); setSearch(''); setPage(1) }} sx={{p:2, display:'flex', alignItems:'center', gap:2, minWidth:160, cursor:'pointer', boxShadow: filterMode==='all' ? '0 8px 30px rgba(91,111,217,0.08)' : ''}}>
                <Avatar sx={{bgcolor:'#eef2ff', color:'#374151'}}>P</Avatar>
                <Stack>
                    <Typography sx={{fontWeight:700}}>{totalProducts}</Typography>
                    <Typography variant='caption' color='text.secondary'>Total products</Typography>
                </Stack>
            </Paper>
            <Paper onClick={()=>{ setFilterMode('deleted'); setSearch(''); setPage(1) }} sx={{p:2, display:'flex', alignItems:'center', gap:2, minWidth:160, cursor:'pointer', boxShadow: filterMode==='deleted' ? '0 8px 30px rgba(185,28,28,0.06)' : ''}}>
                <Avatar sx={{bgcolor:'#fff1f2', color:'#b91c1c'}}>D</Avatar>
                <Stack>
                    <Typography sx={{fontWeight:700}}>{deletedCount}</Typography>
                    <Typography variant='caption' color='text.secondary'>Deleted</Typography>
                </Stack>
            </Paper>
            <Paper onClick={()=>{ setFilterMode('lowstock'); setSearch(''); setPage(1) }} sx={{p:2, display:'flex', alignItems:'center', gap:2, minWidth:160, cursor:'pointer', boxShadow: filterMode==='lowstock' ? '0 8px 30px rgba(245,158,11,0.06)' : ''}}>
                <Avatar sx={{bgcolor:'#fef3c7', color:'#92400e'}}>L</Avatar>
                <Stack>
                    <Typography sx={{fontWeight:700}}>{lowStockCount}</Typography>
                    <Typography variant='caption' color='text.secondary'>Low stock (&le;5)</Typography>
                </Stack>
            </Paper>
        </Stack>

        {/* Search bar (moved below stats) */}
        <Box sx={{ mt: 3 }}>
            <TextField value={search} onChange={(e)=>setSearch(e.target.value)} size='small' placeholder='Search products by title...' fullWidth />
        </Box>
     
                { /* show skeleton while products load */ }
                { (productFetchStatus === 'pending') ? (
                    <Box sx={{ width:'100%', p:2 }}>
                        <SkeletonGlobalStyles />
                        <DashboardSkeleton />
                        <ProductListSkeleton />
                    </Box>
                ) : (
          <Grid container spacing={3} sx={{mt:2}}>
            {
                displayedProducts.map((product)=>(
                    <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                        <Stack>
                            <Stack sx={{opacity: product.isDeleted ? 0.7 : 1}}>
                                <ProductCard
                                  id={product._id}
                                  title={product.title}
                                  thumbnail={product.thumbnail}
                                  brand={product.brand?.name || ''}
                                  price={product.price}
                                  isAdminCard={true}
                                  stockQuantity={product.stockQuantity}
                                  rating={product.rating || product.averageRating || 0}
                                  isDeleted={product.isDeleted}
                                  onDelete={handleProductDelete}
                                  onUnDelete={handleProductUnDelete}
                                />
                            </Stack>
                        </Stack>
                    </Grid>
                ))
            }
        </Grid>
        )}

        <Stack alignSelf={is488?'center':'flex-end'} mr={is488?0:5} rowGap={2} p={is488?1:0}>
            <Pagination size={is488?'medium':'large'} page={page}  onChange={(e,page)=>setPage(page)} count={Math.ceil(totalResults/ITEMS_PER_PAGE)} variant="outlined" shape="rounded" />
            <Typography textAlign={'center'}>Showing {(page-1)*ITEMS_PER_PAGE+1} to {page*ITEMS_PER_PAGE>totalResults?totalResults:page*ITEMS_PER_PAGE} of {totalResults} results</Typography>
        </Stack>    
    
    </Stack> 
    </>
  )
}
