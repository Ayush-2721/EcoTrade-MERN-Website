import React from 'react';
import { Box, Card, Container, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';

export const FeatureCards = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: LocalShippingIcon,
      title: 'FREE SHIPPING',
      description: 'On all orders over ₹60k. Fast delivery to your doorstep.',
    },
    {
      icon: SupportAgentIcon,
      title: '24/7 SUPPORT',
      description: 'Dedicated customer service available anytime you need help.',
    },
    {
      icon: SwapHorizIcon,
      title: '7 DAYS RETURN',
      description: 'Easy returns & exchanges within 7 days of purchase.',
    },
    {
      icon: LocationOnIcon,
      title: 'TRACK ORDER',
      description: 'Real-time order tracking from warehouse to delivery.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: isMobile ? '2rem' : '4rem' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      padding: isMobile ? '1.5rem 1rem' : '2rem',
                      textAlign: 'center',
                      border: 'none',
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f9f9f9',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                        backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#ffffff',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: '2.5rem',
                          color: '#4CAF50',
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.5px',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: isMobile ? '0.8rem' : '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </Container>
  );
};
