import React from 'react'
import { Box, Stack, Typography } from '@mui/material'

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 0%, #e6e6e6 50%, #f0f0f0 100%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.2s linear infinite',
}

export const SkeletonBox = ({ width='100%', height=16, borderRadius=4, style={} }) => (
  <Box sx={{ width, height, borderRadius, bgcolor: '#f0f0f0', ...shimmerStyle, ...style }} />
)

export const SkeletonCircle = ({ size=40, style={} }) => (
  <Box sx={{ width: size, height: size, borderRadius: '50%', bgcolor: '#f0f0f0', ...shimmerStyle, ...style }} />
)

export const SkeletonCard = ({ imageHeight=140, lines=3 }) => (
  <Box sx={{ width: '100%', p:1 }}>
    <Box sx={{ width: '100%', height: imageHeight, borderRadius:2, bgcolor:'#f0f0f0', ...shimmerStyle }} />
    <Stack sx={{ mt:1, gap:0.5 }}>
      {Array.from({length: lines}).map((_,i)=> (
        <SkeletonBox key={i} height={12} />
      ))}
    </Stack>
  </Box>
)

export const ProductListSkeleton = ({ columns=8 }) => {
  const items = Array.from({length: Math.min(columns, 8)})
  return (
    <Box sx={{ display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
      {items.map((_,i)=> (
        <SkeletonCard key={i} imageHeight={160} lines={3} />
      ))}
    </Box>
  )
}

export const ProductDetailsSkeleton = () => (
  <Stack direction={{xs:'column', md:'row'}} spacing={3} sx={{ width:'100%' }}>
    <Box sx={{ flex:1 }}>
      <SkeletonBox width={'100%'} height={360} />
    </Box>
    <Stack sx={{ width: 320, gap:1 }}>
      <SkeletonBox height={28} width={'70%'} />
      <SkeletonBox height={20} width={'40%'} />
      <SkeletonBox height={18} width={'30%'} />
      <SkeletonBox height={44} width={'100%'} />
      <SkeletonBox height={12} width={'80%'} />
      <SkeletonBox height={12} width={'90%'} />
    </Stack>
  </Stack>
)

export const OrdersSkeleton = ({ rows=3 }) => (
  <Stack spacing={2}>
    {Array.from({length: rows}).map((_,i)=> (
      <Box key={i} sx={{ p:2, background:'#fff', borderRadius:2 }}>
        <SkeletonBox height={14} width={'40%'} />
        <SkeletonBox height={12} width={'60%'} style={{ marginTop:8 }} />
        <SkeletonBox height={12} width={'30%'} style={{ marginTop:8 }} />
      </Box>
    ))}
  </Stack>
)

export const ProfileSkeleton = () => (
  <Stack spacing={2} sx={{ maxWidth:1200, margin:'0 auto' }}>
    <Stack direction={'row'} spacing={2} alignItems='center'>
      <SkeletonCircle size={96} />
      <Stack spacing={1}>
        <SkeletonBox height={20} width={220} />
        <SkeletonBox height={14} width={160} />
      </Stack>
    </Stack>
    <SkeletonBox height={120} />
  </Stack>
)

export const DashboardSkeleton = () => (
  <Stack spacing={2}>
    <Stack direction={'row'} spacing={2}>
      <SkeletonBox height={80} width={'25%'} />
      <SkeletonBox height={80} width={'25%'} />
      <SkeletonBox height={80} width={'25%'} />
      <SkeletonBox height={80} width={'25%'} />
    </Stack>
    <Stack spacing={1}>
      <SkeletonBox height={12} width={'60%'} />
      <SkeletonBox height={12} width={'80%'} />
    </Stack>
  </Stack>
)

export default {
  SkeletonBox,
  SkeletonCard,
  ProductListSkeleton,
  ProductDetailsSkeleton,
  OrdersSkeleton,
  ProfileSkeleton,
  DashboardSkeleton
}

/* add keyframes globally via a tiny style tag insertion technique if needed */
export const SkeletonGlobalStyles = () => (
  <style>{`@keyframes skeleton-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
)
