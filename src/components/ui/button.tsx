import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:scale-105 shadow-lg hover:shadow-xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-to-r from-success to-success-glow text-success-foreground hover:scale-105 shadow-lg hover:shadow-xl",
        earn: "bg-gradient-to-r from-success via-accent to-primary text-white hover:scale-105 shadow-lg hover:shadow-xl animate-pulse",
        mobile: "h-14 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:scale-105 shadow-lg hover:shadow-xl text-base font-bold",
        multicultural: "bg-gradient-to-r from-teal via-magenta to-accent text-white hover:shadow-2xl hover:shadow-magenta/25 transition-all duration-300 hover:scale-105",
        celebration: "bg-gradient-to-r from-achievement to-coral text-white hover:shadow-xl hover:shadow-achievement/30 transition-all duration-300 hover:scale-105",
        cultural: "bg-gradient-to-r from-cultural to-primary text-white hover:shadow-lg hover:shadow-cultural/25 transition-all duration-300 hover:scale-105",
        ocean: "bg-gradient-to-r from-teal to-teal-glow text-white hover:shadow-xl hover:shadow-teal/30 transition-all duration-300 hover:scale-105",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-xl px-10 text-lg",
        icon: "h-12 w-12",
        mobile: "h-14 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
