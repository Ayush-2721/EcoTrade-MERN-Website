import React from 'react';
import { Box, Button, Container, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export const HeroBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleShopNow = () => {
    // If we're already on the home page, scroll to products section
    if (location.pathname === '/') {
      const productSection = document.getElementById('product-list-section');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on a different page, navigate to home
      navigate('/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: isMobile ? '3rem 1rem' : '6rem 2rem',
          borderRadius: '12px',
          margin: isMobile ? '1rem' : '2rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: isMobile ? '300px' : '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <motion.div variants={itemVariants}>
              <Typography
                sx={{
                  fontSize: isMobile ? '2rem' : '3.5rem',
                  fontWeight: 800,
                  color: 'white',
                  textAlign: 'center',
                  letterSpacing: '1px',
                  marginBottom: '1rem',
                  lineHeight: 1.3,
                }}
              >
                Your Trusted Online Second-Hand Marketplace
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                sx={{
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                  maxWidth: '700px',
                  lineHeight: 1.8,
                }}
              >
                An online platform that connects buyers and sellers of second-hand goods, promoting affordability, reuse, and eco-friendly shopping.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={handleShopNow}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '0.9rem 2.5rem',
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  fontWeight: 700,
                  borderRadius: '30px',
                  marginTop: '1.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#3d8b40',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                SHOP NOW →
              </Button>
            </motion.div>
          </Stack>
        </Container>
      </Box>
    </motion.div>
  );
};
