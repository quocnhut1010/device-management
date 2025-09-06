import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const animations = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 },
};
const AnimatedPage = ({ children }) => {
    return (_jsx(motion.div, { initial: animations.initial, animate: animations.animate, exit: animations.exit, transition: animations.transition, children: children }));
};
export default AnimatedPage;
