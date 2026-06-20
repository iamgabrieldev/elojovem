"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale";
  direction?: "left" | "right" | "up" | "down";
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  },
};

export function PageTransition({
  children,
  variant = "fade",
  direction = "right",
}: PageTransitionProps) {
  const pathname = usePathname();

  // Select the appropriate animation variant
  let selectedVariant = variants.fade;

  if (variant === "slide") {
    selectedVariant = direction === "left" ? variants.slideLeft : variants.slideRight;
    if (direction === "up") selectedVariant = variants.slideUp;
    if (direction === "down") selectedVariant = variants.slideDown;
  } else if (variant === "scale") {
    selectedVariant = variants.scale;
  }

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={selectedVariant.transition}
    >
      {children}
    </motion.div>
  );
}
