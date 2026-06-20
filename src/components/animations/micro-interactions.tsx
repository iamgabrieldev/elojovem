"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useState, useMemo } from "react";

// Confetti explosion animation (for celebrations like habit check)
interface ConfettiPieceProps {
  delay: number;
  seed: number;
}

function ConfettiPiece({ delay, seed }: ConfettiPieceProps) {
  // Use seed to generate pseudo-random values deterministically
  const random1 = ((Math.sin(seed * 12.9898) * 43758.5453) % 1);
  const random2 = ((Math.sin(seed * 78.233) * 43758.5453) % 1);
  const random3 = ((Math.sin(seed * 45.164) * 43758.5453) % 1);
  const random4 = ((Math.sin(seed * 94.673) * 43758.5453) % 1);
  const random5 = ((Math.sin(seed * 12.165) * 43758.5453) % 1);

  const randomX = random1 * 200 - 100;
  const randomY = random2 * 300 - 100;
  const randomRotation = random3 * 720;
  const randomScale = random4 * 0.5 + 0.5;
  const confettiEmoji = ["🎉", "✨", "🎊", "🌟", "💫"][Math.floor(random5 * 5)];

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: randomScale }}
      animate={{ 
        opacity: 0, 
        x: randomX, 
        y: randomY, 
        rotate: randomRotation,
      }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className="fixed pointer-events-none text-2xl"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: "-10px",
        marginTop: "-10px",
      }}
    >
      {confettiEmoji}
    </motion.div>
  );
}

export interface ConfettiExplosionProps {
  count?: number;
  duration?: number;
  autoHide?: boolean;
}

export function ConfettiExplosion({
  count = 20,
  duration = 1.5,
  autoHide = true,
}: ConfettiExplosionProps) {
  return (
    <div className="pointer-events-none fixed inset-0">
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} delay={i * 0.05} seed={i} />
      ))}
    </div>
  );
}

// Success animation overlay
export interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  icon?: string;
  duration?: number;
}

export function SuccessAnimation({
  show,
  message = "Sucesso!",
  icon = "✓",
  duration = 2,
}: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Shake animation for errors
export interface ShakeAnimationProps {
  children: ReactNode;
  trigger?: boolean;
}

export function ShakeAnimation({ children, trigger = false }: ShakeAnimationProps) {
  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      animate={trigger ? "shake" : ""}
      variants={shakeVariants}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation (attention grabber)
export interface PulseAnimationProps {
  children: ReactNode;
  pulse?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}

export function PulseAnimation({
  children,
  pulse = true,
  color = "primary",
}: PulseAnimationProps) {
  const colors = {
    primary: "rgba(217, 119, 6, 0.3)",
    success: "rgba(16, 185, 129, 0.3)",
    warning: "rgba(245, 158, 11, 0.3)",
    danger: "rgba(239, 68, 68, 0.3)",
  };

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
      }}
      className="relative"
    >
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0, 0.5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            backgroundColor: colors[color],
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

// Stagger children animations
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
}

export function StaggerItem({ children }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 100 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Button press feedback
export interface ButtonPressAnimationProps {
  children: ReactNode;
}

export function ButtonPressAnimation({ children }: ButtonPressAnimationProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Bounce entrance
export interface BounceEntranceProps {
  children: ReactNode;
  delay?: number;
}

export function BounceEntrance({ children, delay = 0 }: BounceEntranceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
