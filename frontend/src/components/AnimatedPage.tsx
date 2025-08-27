import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 },
};

const AnimatedPage = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      exit={animations.exit}
      transition={animations.transition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
