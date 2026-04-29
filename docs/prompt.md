Navbar:
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
tubelight-navbar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}


demo.tsx
import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText }
  ]

  return <NavBar items={navItems} />
}
```

Install NPM dependencies:
```bash
lucide-react, framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

with galssmorhpism, apple style. with respect to our theme. 



main hero, with scroll anmation, scroll morph parralllax , ofor the landing  page  stroytelling You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
shader-animation.tsx
"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: any
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
      }
    `

    // Initialize Three.js scene
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    container.appendChild(renderer.domElement)

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    // Initial resize
    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05
      renderer.render(scene, camera)

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    // Start animation
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize)

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-screen"
      style={{
        background: "#000",
        overflow: "hidden",
      }}
    />
  )
}


demo.tsx
import { ShaderAnimation } from "@/components/ui/shader-animation";

export default function DemoOne() {
  return (
    <div className="relative flex h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-blue-700">
      <ShaderAnimation/>
      <span className="absolute pointer-events-none z-10 text-center text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white">
        Shader Animation
      </span>
    </div>
  )
}
```

Install NPM dependencies:
```bash
three
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them


global text animation on landing page" 
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
text-effect.tsx
'use client';

import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  TargetAndTransition,
  Variants,
} from 'framer-motion';
import React from 'react';

type PresetType = 'blur' | 'shake' | 'scale' | 'fade' | 'slide';

type TextEffectProps = {
  children: string;
  per?: 'word' | 'char' | 'line';
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  segmentWrapperClassName?: string;
};

const defaultStaggerTimes: Record<'char' | 'word' | 'line', number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: { opacity: 0 },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(12px)' },
    },
  },
  shake: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 0 },
      visible: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
      exit: { x: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
};

const AnimationComponent: React.FC<{
  segment: string;
  variants: Variants;
  per: 'line' | 'word' | 'char';
  segmentWrapperClassName?: string;
}> = React.memo(({ segment, variants, per, segmentWrapperClassName }) => {
  const content =
    per === 'line' ? (
      <motion.span variants={variants} className='block'>
        {segment}
      </motion.span>
    ) : per === 'word' ? (
      <motion.span
        aria-hidden='true'
        variants={variants}
        className='inline-block whitespace-pre'
      >
        {segment}
      </motion.span>
    ) : (
      <motion.span className='inline-block whitespace-pre'>
        {segment.split('').map((char, charIndex) => (
          <motion.span
            key={`char-${charIndex}`}
            aria-hidden='true'
            variants={variants}
            className='inline-block whitespace-pre'
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );

  if (!segmentWrapperClassName) {
    return content;
  }

  const defaultWrapperClassName = per === 'line' ? 'block' : 'inline-block';

  return (
    <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
      {content}
    </span>
  );
});

AnimationComponent.displayName = 'AnimationComponent';

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset,
  delay = 0,
  trigger = true,
  onAnimationComplete,
  segmentWrapperClassName,
}: TextEffectProps) {
  let segments: string[];

  if (per === 'line') {
    segments = children.split('
');
  } else if (per === 'word') {
    segments = children.split(/(\s+)/);
  } else {
    segments = children.split('');
  }

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };
  const containerVariants = variants?.container || selectedVariants.container;
  const itemVariants = variants?.item || selectedVariants.item;
  const ariaLabel = per === 'line' ? undefined : children;

  const stagger = defaultStaggerTimes[per];

  const delayedContainerVariants: Variants = {
    hidden: containerVariants.hidden,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...(containerVariants.visible as TargetAndTransition)?.transition,
        staggerChildren:
          (containerVariants.visible as TargetAndTransition)?.transition
            ?.staggerChildren || stagger,
        delayChildren: delay,
      },
    },
    exit: containerVariants.exit,
  };

  return (
    <AnimatePresence mode='popLayout'>
      {trigger && (
        <MotionTag
          initial='hidden'
          animate='visible'
          exit='exit'
          aria-label={ariaLabel}
          variants={delayedContainerVariants}
          className={cn('whitespace-pre-wrap', className)}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, index) => (
            <AnimationComponent
              key={`${per}-${index}-${segment}`}
              segment={segment}
              variants={itemVariants}
              per={per}
              segmentWrapperClassName={segmentWrapperClassName}
            />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  );
}


demo.tsx
'use client';

import React, { useState, useEffect } from "react";
import { TextEffect } from "@/components/ui/text-effect";

function TextEffectPerChar() {
  return (
    <TextEffect per='char' preset='fade'>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithPreset() {
  return (
    <TextEffect per='word' as='h3' preset='slide'>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithCustomVariants() {
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const fancyVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: () => ({
        opacity: 0,
        y: Math.random() * 100 - 50,
        rotate: Math.random() * 90 - 45,
        scale: 0.3,
        color: getRandomColor(),
      }),
      visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        color: getRandomColor(),
        transition: {
          type: 'spring',
          damping: 12,
          stiffness: 200,
        },
      },
    },
  };

  return (
    <TextEffect per='word' variants={fancyVariants}>
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithCustomDelay() {
  return (
    <div className='flex flex-col space-y-0'>
      <TextEffect
        per='char'
        delay={0.5}
        variants={{
          container: {
            hidden: {
              opacity: 0,
            },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          },
          item: {
            hidden: {
              opacity: 0,
              rotateX: 90,
              y: 10,
            },
            visible: {
              opacity: 1,
              rotateX: 0,
              y: 0,
              transition: {
                duration: 0.2,
              },
            },
          },
        }}
      >
        Animate your ideas
      </TextEffect>
      <TextEffect per='char' delay={1.5}>
        with motion-primitives
      </TextEffect>
      <TextEffect
        per='char'
        delay={2.5}
        className='pt-12 text-xs'
        preset='blur'
      >
        (and delay!)
      </TextEffect>
    </div>
  );
}

function TextEffectPerLine() {
  return (
    <TextEffect
      per='line'
      as='p'
      segmentWrapperClassName='overflow-hidden block'
      variants={{
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        },
        item: {
          hidden: {
            opacity: 0,
            y: 40,
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
            },
          },
        },
      }}
    >
      {`now live on motion-primitives!
now live on motion-primitives!
now live on motion-primitives!`}
    </TextEffect>
  );
}

function TextEffectWithExit() {
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  const blurSlideVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.01 },
      },
      exit: {
        transition: { staggerChildren: 0.01, staggerDirection: 1 },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        filter: 'blur(10px) brightness(0%)',
        y: 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px) brightness(100%)',
        transition: {
          duration: 0.4,
        },
      },
      exit: {
        opacity: 0,
        y: -30,
        filter: 'blur(10px) brightness(0%)',
        transition: {
          duration: 0.4,
        },
      },
    },
  };

  return (
    <TextEffect
      className='inline-flex'
      per='char'
      variants={blurSlideVariants}
      trigger={trigger}
    >
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

export {
  TextEffectPerChar,
  TextEffectWithPreset,
  TextEffectWithCustomVariants,
  TextEffectWithCustomDelay,
  TextEffectPerLine,
  TextEffectWithExit,
};

```

Install NPM dependencies:
```bash
framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them



footer withYou are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
gravity.tsx
import {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { debounce } from "lodash"
import Matter, {
  Bodies,
  Common,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Query,
  Render,
  Runner,
  World,
} from "matter-js"

import { cn } from "@/lib/utils"

import SVGPathCommander from 'svg-path-commander';

// Function to convert SVG path "d" to vertices
function parsePathToVertices(path: string, sampleLength = 15) {
// Convert path to absolute commands
const commander = new SVGPathCommander(path);

    const points: { x: number, y: number }[] = [];
    let lastPoint: { x: number, y: number } | null = null;

    // Get total length of the path
    const totalLength = commander.getTotalLength();
    let length = 0;

    // Sample points along the path
    while (length < totalLength) {
        const point = commander.getPointAtLength(length);

        // Only add point if it's different from the last one
        if (!lastPoint || point.x !== lastPoint.x || point.y !== lastPoint.y) {
            points.push({ x: point.x, y: point.y });
            lastPoint = point;
        }

        length += sampleLength;
    }

    // Ensure we get the last point
    const finalPoint = commander.getPointAtLength(totalLength);
    if (lastPoint && (finalPoint.x !== lastPoint.x || finalPoint.y !== lastPoint.y)) {
        points.push({ x: finalPoint.x, y: finalPoint.y });
    }

    return points;

}

function calculatePosition(
  value: number | string | undefined,
  containerSize: number,
  elementSize: number
) {
  if (typeof value === "string" && value.endsWith("%")) {
    const percentage = parseFloat(value) / 100;
    return containerSize * percentage;
  }
  return typeof value === "number"
    ? value
    : elementSize - containerSize + elementSize / 2;
}

type GravityProps = {
  children: ReactNode
  debug?: boolean
  gravity?: { x: number; y: number }
  resetOnResize?: boolean
  grabCursor?: boolean
  addTopWall?: boolean
  autoStart?: boolean
  className?: string
}

type PhysicsBody = {
  element: HTMLElement
  body: Matter.Body
  props: MatterBodyProps
}

type MatterBodyProps = {
  children: ReactNode
  matterBodyOptions?: Matter.IBodyDefinition
  isDraggable?: boolean
  bodyType?: "rectangle" | "circle" | "svg"
  sampleLength?: number
  x?: number | string
  y?: number | string
  angle?: number
  className?: string
}

export type GravityRef = {
  start: () => void
  stop: () => void
  reset: () => void
}

const GravityContext = createContext<{
  registerElement: (
    id: string,
    element: HTMLElement,
    props: MatterBodyProps
  ) => void
  unregisterElement: (id: string) => void
} | null>(null)

const MatterBody = ({
  children,
  className,
  matterBodyOptions = {
    friction: 0.1,
    restitution: 0.1,
    density: 0.001,
    isStatic: false,
  },
  bodyType = "rectangle",
  isDraggable = true,
  sampleLength = 15,
  x = 0,
  y = 0,
  angle = 0,
  ...props
}: MatterBodyProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(GravityContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      sampleLength,
      isDraggable,
      x,
      y,
      angle,
      ...props,
    })

    return () => context.unregisterElement(idRef.current)
  }, [props, children, matterBodyOptions, isDraggable])

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute",
        className,
        isDraggable && "pointer-events-none"
      )}
    >
      {children}
    </div>
  )
}

const Gravity = forwardRef<GravityRef, GravityProps>(
  (
    {
      children,
      debug = false,
      gravity = { x: 0, y: 1 },
      grabCursor = true,
      resetOnResize = true,
      addTopWall = true,
      autoStart = true,
      className,
      ...props
    },
    ref
  ) => {
    const canvas = useRef<HTMLDivElement>(null)
    const engine = useRef(Engine.create())
    const render = useRef<Render>()
    const runner = useRef<Runner>()
    const bodiesMap = useRef(new Map<string, PhysicsBody>())
    const frameId = useRef<number>()
    const mouseConstraint = useRef<Matter.MouseConstraint>()
    const mouseDown = useRef(false)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    const isRunning = useRef(false)

    // Register Matter.js body in the physics world
    const registerElement = useCallback(
      (id: string, element: HTMLElement, props: MatterBodyProps) => {
        if (!canvas.current) return
        const width = element.offsetWidth
        const height = element.offsetHeight
        const canvasRect = canvas.current!.getBoundingClientRect()

        const angle = (props.angle || 0) * (Math.PI / 180)

        const x = calculatePosition(props.x, canvasRect.width, width)
        const y = calculatePosition(props.y, canvasRect.height, height)

        let body
        if (props.bodyType === "circle") {
          const radius = Math.max(width, height) / 2
          body = Bodies.circle(x, y, radius, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else if (props.bodyType === "svg") {
          const paths = element.querySelectorAll("path")
          const vertexSets: Matter.Vector[][] = []

          paths.forEach((path) => {
            const d = path.getAttribute("d")
            const p = parsePathToVertices(d!, props.sampleLength)
            vertexSets.push(p)
          })

          body = Bodies.fromVertices(x, y, vertexSets, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else {
          body = Bodies.rectangle(x, y, width, height, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        }

        if (body) {
          World.add(engine.current.world, [body])
          bodiesMap.current.set(id, { element, body, props })
        }
      },
      [debug]
    )

    // Unregister Matter.js body from the physics world
    const unregisterElement = useCallback((id: string) => {
      const body = bodiesMap.current.get(id)
      if (body) {
        World.remove(engine.current.world, body.body)
        bodiesMap.current.delete(id)
      }
    }, [])

    // Keep react elements in sync with the physics world
    const updateElements = useCallback(() => {
      bodiesMap.current.forEach(({ element, body }) => {
        const { x, y } = body.position
        const rotation = body.angle * (180 / Math.PI)

        element.style.transform = `translate(${
          x - element.offsetWidth / 2
        }px, ${y - element.offsetHeight / 2}px) rotate(${rotation}deg)`
      })

      frameId.current = requestAnimationFrame(updateElements)
    }, [])

    const initializeRenderer = useCallback(() => {
      if (!canvas.current) return

      const height = canvas.current.offsetHeight
      const width = canvas.current.offsetWidth

      Common.setDecomp(require("poly-decomp"))

      engine.current.gravity.x = gravity.x
      engine.current.gravity.y = gravity.y

      render.current = Render.create({
        element: canvas.current,
        engine: engine.current,
        options: {
          width,
          height,
          wireframes: false,
          background: "#00000000",
        },
      })

      const mouse = Mouse.create(render.current.canvas)
      mouseConstraint.current = MouseConstraint.create(engine.current, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: debug,
          },
        },
      })

      // Add walls
      const walls = [
        // Floor
        Bodies.rectangle(width / 2, height + 10, width, 20, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        // Right wall
        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        // Left wall
        Bodies.rectangle(-10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),
      ]

      const topWall = addTopWall
        ? Bodies.rectangle(width / 2, -10, width, 20, {
            isStatic: true,
            friction: 1,
            render: {
              visible: debug,
            },
          })
        : null

      if (topWall) {
        walls.push(topWall)
      }

      const touchingMouse = () =>
        Query.point(
          engine.current.world.bodies,
          mouseConstraint.current?.mouse.position || { x: 0, y: 0 }
        ).length > 0

      if (grabCursor) {
        Events.on(engine.current, "beforeUpdate", (event) => {
          if (canvas.current) {
            if (!mouseDown.current && !touchingMouse()) {
              canvas.current.style.cursor = "default"
            } else if (touchingMouse()) {
              canvas.current.style.cursor = mouseDown.current
                ? "grabbing"
                : "grab"
            }
          }
        })

        canvas.current.addEventListener("mousedown", (event) => {
          mouseDown.current = true

          if (canvas.current) {
            if (touchingMouse()) {
              canvas.current.style.cursor = "grabbing"
            } else {
              canvas.current.style.cursor = "default"
            }
          }
        })
        canvas.current.addEventListener("mouseup", (event) => {
          mouseDown.current = false

          if (canvas.current) {
            if (touchingMouse()) {
              canvas.current.style.cursor = "grab"
            } else {
              canvas.current.style.cursor = "default"
            }
          }
        })
      }

      World.add(engine.current.world, [mouseConstraint.current, ...walls])

      render.current.mouse = mouse

      runner.current = Runner.create()
      Render.run(render.current)
      updateElements()
      runner.current.enabled = false

      if (autoStart) {
        runner.current.enabled = true
        startEngine()
      }
    }, [updateElements, debug, autoStart])

    // Clear the Matter.js world
    const clearRenderer = useCallback(() => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }

      if (mouseConstraint.current) {
        World.remove(engine.current.world, mouseConstraint.current)
      }

      if (render.current) {
        Mouse.clearSourceEvents(render.current.mouse)
        Render.stop(render.current)
        render.current.canvas.remove()
      }

      if (runner.current) {
        Runner.stop(runner.current)
      }

      if (engine.current) {
        World.clear(engine.current.world, false)
        Engine.clear(engine.current)
      }

      bodiesMap.current.clear()
    }, [])

    const handleResize = useCallback(() => {
      if (!canvas.current || !resetOnResize) return

      const newWidth = canvas.current.offsetWidth
      const newHeight = canvas.current.offsetHeight

      setCanvasSize({ width: newWidth, height: newHeight })

      // Clear and reinitialize
      clearRenderer()
      initializeRenderer()
    }, [clearRenderer, initializeRenderer, resetOnResize])

    const startEngine = useCallback(() => {
      if (runner.current) {
        runner.current.enabled = true

        Runner.run(runner.current, engine.current)
      }
      if (render.current) {
        Render.run(render.current)
      }
      frameId.current = requestAnimationFrame(updateElements)
      isRunning.current = true
    }, [updateElements, canvasSize])

    const stopEngine = useCallback(() => {
      if (!isRunning.current) return

      if (runner.current) {
        Runner.stop(runner.current)
      }
      if (render.current) {
        Render.stop(render.current)
      }
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      isRunning.current = false
    }, [])

    const reset = useCallback(() => {
      stopEngine()
      bodiesMap.current.forEach(({ element, body, props }) => {
        body.angle = props.angle || 0

        const x = calculatePosition(
          props.x,
          canvasSize.width,
          element.offsetWidth
        )
        const y = calculatePosition(
          props.y,
          canvasSize.height,
          element.offsetHeight
        )
        body.position.x = x
        body.position.y = y
      })
      updateElements()
      handleResize()
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        start: startEngine,
        stop: stopEngine,
        reset,
      }),
      [startEngine, stopEngine]
    )

    useEffect(() => {
      if (!resetOnResize) return

      const debouncedResize = debounce(handleResize, 500)
      window.addEventListener("resize", debouncedResize)

      return () => {
        window.removeEventListener("resize", debouncedResize)
        debouncedResize.cancel()
      }
    }, [handleResize, resetOnResize])

    useEffect(() => {
      initializeRenderer()
      return clearRenderer
    }, [initializeRenderer, clearRenderer])

    return (
      <GravityContext.Provider value={{ registerElement, unregisterElement }}>
        <div
          ref={canvas}
          className={cn(className, "absolute top-0 left-0 w-full h-full")}
          {...props}
        >
          {children}
        </div>
      </GravityContext.Provider>
    )
  }
)

Gravity.displayName = "Gravity"
export { Gravity, MatterBody }


demo.tsx
import { Gravity, MatterBody } from "@/components/ui/gravity";

function Preview() {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col relative font-azeretMono">
      <div className="pt-20 text-6xl sm:text-7xl md:text-8xl text-black w-full text-center font-calendas italic">
        fancy
      </div>
      <p className="pt-4 text-base sm:text-xl md:text-2xl text-black w-full text-center">
        components made with:
      </p>
      <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#0015ff] text-white rounded-full hover:cursor-pointer px-8 py-4">
            react
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="30%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#E794DA] text-white rounded-full hover:cursor-grab px-8 py-4 ">
            typescript
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="40%"
          y="20%"
          angle={10}
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#1f464d]  text-white rounded-full hover:cursor-grab px-8 py-4 ">
            motion
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="75%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#ff5941]  text-white [#E794DA] rounded-full hover:cursor-grab px-8 py-4 ">
            tailwind
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="80%"
          y="20%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-orange-500  text-white [#E794DA] rounded-full hover:cursor-grab px-8 py-4 ">
            drei
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="50%"
          y="10%"
        >
          <div className="text-xl sm:text-2xl md:text-3xl bg-[#ffd726]  text-white [#E794DA] rounded-full hover:cursor-grab px-8 py-4 ">
            matter-js
          </div>
        </MatterBody>
      </Gravity>
    </div>
  );
}

export { Preview };

```

Install NPM dependencies:
```bash
lodash, matter-js, poly-decomp, svg-path-commander
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them


last cta You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
3d-button.tsx
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg")}>

      <button className="button">
        <div className="bg" />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" height={208} width={342} className="splash">
          <path strokeLinecap="round" strokeWidth={3} d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362" />
          <path strokeLinecap="round" strokeWidth={3} d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449" />
          <path strokeLinecap="round" strokeWidth={3} d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998" />
          <path strokeLinecap="round" strokeWidth={3} d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924" />
          <path strokeLinecap="round" strokeWidth={3} d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998" />
          <path strokeLinecap="round" strokeWidth={3} d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272" />
          <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449" />
        </svg>
        <div className="wrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height={42} width={221} className="path">
            <path strokeLinecap="round" strokeWidth={3} d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855" />
          </svg>
          <div className="outline" />
          <div className="content">
            <span className="char state-1">
              <span data-label="J" style={{"--i": 1}}>J</span>
              <span data-label="o" style={{"--i": 2}}>o</span>
              <span data-label="i" style={{"--i": 3}}>i</span>
              <span data-label="n" style={{"--i": 4}}>n</span>
              <span data-label="T" style={{"--i": 5}}>T</span>
              <span data-label="o" style={{"--i": 6}}>o</span>
              <span data-label="d" style={{"--i": 7}}>d</span>
              <span data-label="a" style={{"--i": 8}}>a</span>
              <span data-label="y" style={{"--i": 9}}>y</span>
            </span>
            <div className="icon">
              <div />
            </div>
            <span className="char state-2">
              <span data-label="J" style={{"--i": 1}}>J</span>
              <span data-label="o" style={{"--i": 2}}>o</span>
              <span data-label="i" style={{"--i": 3}}>i</span>
              <span data-label="n" style={{"--i": 4}}>n</span>
              <span data-label="N" style={{"--i": 5}}>N</span>
              <span data-label="o" style={{"--i": 6}}>o</span>
              <span data-label="w" style={{"--i": 7}}>w</span>
            </span>
          </div>
        </div>
      </button>
   

    </div>
  );
};


demo.tsx
import { Component } from "@/components/ui/3d-button";

export default function DemoOne() {
  return <Component />;
}

```

Extend existing Tailwind 4 index.css with this code (or if project uses Tailwind 3, extend tailwind.config.js or globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes charAppear {
  0% {
    transform: translateY(50%);
    opacity: 0;
    filter: blur(20px);
  }
  20% {
    transform: translateY(70%);
    opacity: 1;
  }
  50% {
    transform: translateY(-15%);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes charDisappear {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-70%);
    opacity: 0;
    filter: blur(3px);
  }
}

@keyframes arrow {
  0% {
    opacity: 1;
  }
  50% {
    transform: translateX(60px);
    opacity: 0;
  }
  51% {
    transform: translateX(-200px);
    opacity: 0;
  }
  100% {
    transform: translateX(-128px);
    opacity: 1;
  }
}

@keyframes swingArrow {
  50% {
    transform: translateX(5px) scale(0.9);
  }
}

@keyframes rotateArrowLine {
  50% {
    transform: rotate(30deg);
  }
  80% {
    transform: rotate(55deg);
  }
}

@keyframes rotateArrowLine2 {
  50% {
    transform: rotate(330deg);
  }
  80% {
    transform: rotate(300deg);
  }
}

@keyframes resetArrow {
  0% {
    transform: translateX(-128px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes path {
  from {
    stroke: white;
  }
  to {
    stroke-dashoffset: -480;
    stroke: #f9c6fe;
  }
}

@keyframes splash {
  to {
    stroke-dasharray: 2 60;
    stroke-dashoffset: -60;
  }
}
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
