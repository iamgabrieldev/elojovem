"use client";

import { motion } from "framer-motion";
import type { Panel } from "@/lib/stories";

type Illustration = {
  name: string;
  element: React.ReactNode;
};

const getMoodColors = (mood: Panel["mood"]) => {
  const colorMap: Record<Panel["mood"], { primary: string; secondary: string; accent: string }> = {
    joy: { primary: "#FCD34D", secondary: "#FBBF24", accent: "#F59E0B" },
    calm: { primary: "#A1E3E3", secondary: "#7FD3D3", accent: "#5BC0C0" },
    hope: { primary: "#87CEEB", secondary: "#63B8E8", accent: "#3FA9E1" },
    love: { primary: "#F472B6", secondary: "#EC4899", accent: "#DB2777" },
    strength: { primary: "#FB923C", secondary: "#F97316", accent: "#EA580C" },
    peace: { primary: "#A78BFA", secondary: "#9370DB", accent: "#7C3AED" },
    gratitude: { primary: "#FDE047", secondary: "#FBBF24", accent: "#F59E0B" },
    grace: { primary: "#DDD6FE", secondary: "#C7D2FE", accent: "#A5B4FC" },
  };
  return colorMap[mood];
};

// SVG Illustrations for each story theme
const ILLUSTRATIONS: Record<string, Illustration> = {
  "bread-sharing": {
    name: "Pão Compartilhado",
    element: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Hands sharing bread */}
        <g id="hands">
          {/* Left hand */}
          <path d="M 50 120 Q 40 100 50 80 L 60 80 Q 50 100 60 120 Z" fill="#D4A574" />
          <circle cx="55" cy="70" r="8" fill="#D4A574" />
          
          {/* Right hand */}
          <path d="M 150 120 Q 160 100 150 80 L 140 80 Q 150 100 140 120 Z" fill="#D4A574" />
          <circle cx="145" cy="70" r="8" fill="#D4A574" />
        </g>
        
        {/* Bread in center */}
        <g id="bread">
          <ellipse cx="100" cy="100" rx="30" ry="25" fill="#C19A6B" />
          <path d="M 80 90 Q 100 85 120 90" stroke="#8B7355" strokeWidth="1" fill="none" />
          <path d="M 80 100 Q 100 95 120 100" stroke="#8B7355" strokeWidth="1" fill="none" />
          <path d="M 85 110 Q 100 108 115 110" stroke="#8B7355" strokeWidth="1" fill="none" />
        </g>
        
        {/* Light rays */}
        <g id="light" opacity="0.6">
          <line x1="100" y1="20" x2="100" y2="45" stroke="#FFD700" strokeWidth="2" />
          <line x1="70" y1="35" x2="85" y2="50" stroke="#FFD700" strokeWidth="2" />
          <line x1="130" y1="35" x2="115" y2="50" stroke="#FFD700" strokeWidth="2" />
        </g>
      </svg>
    ),
  },

  "storm-calm": {
    name: "Tempestade Acalma",
    element: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Water waves */}
        <g id="water">
          <path d="M 0 120 Q 25 110 50 120 T 100 120 T 150 120 T 200 120 L 200 200 L 0 200 Z" fill="#5DADE2" opacity="0.7" />
          <path d="M 0 130 Q 25 125 50 130 T 100 130 T 150 130 T 200 130 L 200 200 L 0 200 Z" fill="#3498DB" opacity="0.5" />
        </g>
        
        {/* Boat/Person */}
        <circle cx="100" cy="110" r="12" fill="#D2691E" />
        <path d="M 100 95 L 100 110 M 90 105 L 110 105" stroke="#D2691E" strokeWidth="2" />
        
        {/* Rainbow arc (hope) */}
        <g id="rainbow">
          <path d="M 40 100 Q 60 50 100 50 Q 140 50 160 100" stroke="#FF0000" strokeWidth="2" fill="none" />
          <path d="M 45 105 Q 65 60 100 60 Q 135 60 155 105" stroke="#FFD700" strokeWidth="2" fill="none" />
          <path d="M 50 110 Q 70 70 100 70 Q 130 70 150 110" stroke="#00FF00" strokeWidth="2" fill="none" />
        </g>
        
        {/* Sun peeking through */}
        <circle cx="160" cy="40" r="15" fill="#FFD700" opacity="0.8" />
      </svg>
    ),
  },

  "growth-flower": {
    name: "Flor em Crescimento",
    element: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Soil/Ground */}
        <ellipse cx="100" cy="160" rx="60" ry="20" fill="#8B7355" opacity="0.6" />
        
        {/* Stem */}
        <path d="M 100 160 Q 95 120 100 80 Q 105 120 100 160" stroke="#2D5016" strokeWidth="3" fill="none" />
        
        {/* Leaves */}
        <ellipse cx="85" cy="130" rx="12" ry="25" fill="#4CAF50" transform="rotate(-30 85 130)" />
        <ellipse cx="115" cy="120" rx="12" ry="25" fill="#4CAF50" transform="rotate(30 115 120)" />
        
        {/* Flower petals */}
        <g id="petals">
          <ellipse cx="100" cy="60" rx="10" ry="18" fill="#FF69B4" />
          <ellipse cx="115" cy="70" rx="10" ry="18" fill="#FF1493" transform="rotate(60 115 70)" />
          <ellipse cx="115" cy="90" rx="10" ry="18" fill="#FF69B4" transform="rotate(120 115 90)" />
          <ellipse cx="100" cy="100" rx="10" ry="18" fill="#FF1493" transform="rotate(180 100 100)" />
          <ellipse cx="85" cy="90" rx="10" ry="18" fill="#FF69B4" transform="rotate(240 85 90)" />
          <ellipse cx="85" cy="70" rx="10" ry="18" fill="#FF1493" transform="rotate(300 85 70)" />
        </g>
        
        {/* Flower center */}
        <circle cx="100" cy="80" r="8" fill="#FFD700" />
        
        {/* Sunshine */}
        <circle cx="30" cy="30" r="12" fill="#FFD700" />
        <line x1="30" y1="10" x2="30" y2="0" stroke="#FFD700" strokeWidth="2" />
        <line x1="50" y1="30" x2="60" y2="30" stroke="#FFD700" strokeWidth="2" />
      </svg>
    ),
  },

  "prayer-hands": {
    name: "Mãos que Rezam",
    element: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Prayer hands */}
        <g id="hands">
          {/* Left hand */}
          <path d="M 80 80 L 85 60 L 85 100 L 80 95 Z" fill="#D4A574" />
          <circle cx="83" cy="50" r="5" fill="#D4A574" />
          
          {/* Right hand */}
          <path d="M 120 80 L 115 60 L 115 100 L 120 95 Z" fill="#D4A574" />
          <circle cx="117" cy="50" r="5" fill="#D4A574" />
          
          {/* Center connection */}
          <path d="M 85 100 Q 100 105 115 100" stroke="#D4A574" strokeWidth="3" fill="none" />
        </g>
        
        {/* Spiritual light/aura */}
        <g id="aura" opacity="0.4">
          <circle cx="100" cy="80" r="50" fill="none" stroke="#FFD700" strokeWidth="2" />
          <circle cx="100" cy="80" r="65" fill="none" stroke="#FFD700" strokeWidth="1" />
        </g>
        
        {/* Doves (peace symbols) */}
        <g id="doves">
          <ellipse cx="70" cy="40" rx="8" ry="6" fill="#E8E8E8" />
          <path d="M 62 40 Q 65 35 70 40" stroke="#E8E8E8" strokeWidth="1" fill="none" />
          <path d="M 78 40 Q 75 35 70 40" stroke="#E8E8E8" strokeWidth="1" fill="none" />
          
          <ellipse cx="130" cy="40" rx="8" ry="6" fill="#E8E8E8" />
          <path d="M 122 40 Q 125 35 130 40" stroke="#E8E8E8" strokeWidth="1" fill="none" />
          <path d="M 138 40 Q 135 35 130 40" stroke="#E8E8E8" strokeWidth="1" fill="none" />
        </g>
      </svg>
    ),
  },

  "family-table": {
    name: "Mesa da Família",
    element: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Table */}
        <rect x="30" y="90" width="140" height="10" fill="#8B4513" />
        <line x1="40" y1="100" x2="40" y2="140" stroke="#8B4513" strokeWidth="2" />
        <line x1="100" y1="100" x2="100" y2="140" stroke="#8B4513" strokeWidth="2" />
        <line x1="160" y1="100" x2="160" y2="140" stroke="#8B4513" strokeWidth="2" />
        
        {/* People around table (simplified) */}
        <g id="people">
          {/* Person 1 */}
          <circle cx="50" cy="60" r="8" fill="#D4A574" />
          <path d="M 50 68 L 50 85" stroke="#FF6B6B" strokeWidth="4" />
          
          {/* Person 2 */}
          <circle cx="100" cy="50" r="8" fill="#D4A574" />
          <path d="M 100 58 L 100 80" stroke="#4ECDC4" strokeWidth="4" />
          
          {/* Person 3 */}
          <circle cx="150" cy="60" r="8" fill="#D4A574" />
          <path d="M 150 68 L 150 85" stroke="#FFE66D" strokeWidth="4" />
        </g>
        
        {/* Food/dishes on table */}
        <g id="dishes">
          <circle cx="70" cy="100" r="6" fill="#FF6B6B" opacity="0.6" />
          <circle cx="130" cy="100" r="6" fill="#FFE66D" opacity="0.6" />
        </g>
        
        {/* Love hearts */}
        <g id="hearts" opacity="0.5">
          <path d="M 40 35 L 45 30 L 50 35 L 50 40 L 45 43 L 40 40 Z" fill="#FF69B4" />
          <path d="M 150 30 L 155 25 L 160 30 L 160 35 L 155 38 L 150 35 Z" fill="#FF69B4" />
        </g>
      </svg>
    ),
  },
};

interface StoryIllustrationProps {
  themeOrStory: string;
  mood: Panel["mood"];
  animated?: boolean;
}

export function StoryIllustration({ 
  themeOrStory, 
  mood, 
  animated = true 
}: StoryIllustrationProps) {
  const colors = getMoodColors(mood);
  
  // Map story titles to illustration keys - memoized to avoid recalculation
  const getIllustrationKey = (story: string): string => {
    const lower = story.toLowerCase();
    if (lower.includes("pão")) return "bread-sharing";
    if (lower.includes("tempestade")) return "storm-calm";
    if (lower.includes("flor")) return "growth-flower";
    if (lower.includes("mão")) return "prayer-hands";
    if (lower.includes("mesa") || lower.includes("família")) return "family-table";
    return "bread-sharing"; // default
  };

  const illustrationKey = getIllustrationKey(themeOrStory);
  const illustration = ILLUSTRATIONS[illustrationKey];

  if (!illustration) {
    return null;
  }

  return (
    <motion.div
      className="mx-auto w-32 h-32"
      initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
      animate={animated ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        filter: `drop-shadow(0 0 15px ${colors.primary}40)`,
      }}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full"
        style={{
          "--primary-color": colors.primary,
          "--secondary-color": colors.secondary,
          "--accent-color": colors.accent,
        } as React.CSSProperties}
      >
        {illustration.element}
      </svg>
    </motion.div>
  );
}
