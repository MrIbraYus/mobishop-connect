import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ text = "Loading...", fullScreen = false }: LoaderProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-12"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
