import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function ensureLightMode() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", false);
  }
}
function removeDarkClasses(className) {
  return className.split(" ").filter((cls) => !cls.startsWith("dark:")).join(" ");
}
export {
  cn,
  ensureLightMode,
  removeDarkClasses
};
