
import { HTMLAttributes} from "react";
import { cn } from "../../../Utils/Utils";

// Card Root
interface CardProps extends HTMLAttributes<HTMLDivElement> {}
export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
};

// CardHeader
interface CardHeaderProps {
  title: string;
  children?: React.ReactNode;  // Make sure this is included
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title, 
  children, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      <h3 className="font-medium leading-none tracking-tight">{title}</h3>
      {children}
    </div>
  );
};

// CardTitle
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <h3 className={cn("font-medium text-lg [text-purple-700]", className)} {...props} />
  );
};

// CardContent
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CardContent = ({ className, ...props }: CardContentProps) => {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
};