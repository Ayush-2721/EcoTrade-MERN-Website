import React, { useEffect } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import {Footer} from '../features/footer/Footer'
import { HeroBanner, FeatureCards } from '../features/home/components'
import { Box } from '@mui/material'

export const HomePage = () => {

  const dispatch=useDispatch()
  const addressStatus=useSelector(selectAddressStatus)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){

      dispatch(resetAddressStatus())
    }
  },[addressStatus, dispatch])

  return (
    <>
    <Navbar isProductList={true}/>
    <Box>
      <HeroBanner />
      <FeatureCards />
    </Box>
    <Box id="product-list-section">
      <ProductList/>
    </Box>
    <Footer/>
    </>
  )
}
