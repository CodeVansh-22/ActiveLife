import React from 'react';
import { motion } from 'framer-motion';
import '../styles/components.css';

const PageTransition = ({ children }) => {
  // ... (variants remains the same)
  const variants = {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.99
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 1.01,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-transition-wrapper"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
