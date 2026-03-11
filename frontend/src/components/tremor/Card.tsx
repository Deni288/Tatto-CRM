// Tremor Raw Card [v0.0.1]

import { Slot } from "@radix-ui/react-slot"
import React from "react"

import { cx } from "@/lib/utils"

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          // base
          "relative w-full rounded-2xl p-6 text-left",
          // Antigravity Glassmorphism
          "bg-black/40 backdrop-blur-xl",
          "border border-white/5",
          "shadow-2xl shadow-black/50",
          // Hover Effect (Levitation)
          "transition-all duration-500 ease-out",
          "hover:border-white/10 hover:shadow-gold-500/5 hover:-translate-y-1",
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = "Card"

export { Card, type CardProps }
