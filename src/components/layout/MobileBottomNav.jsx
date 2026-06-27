"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  BookOpen,
  ClipboardCheck,
  ShoppingCart,
  User,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Courses", path: "/courses", icon: BookOpen },
  { name: "Tests", path: "/test-series", icon: ClipboardCheck },
  { name: "Cart", path: "/cart", icon: ShoppingCart },
  { name: "Profile", path: "/dashboard/student", icon: User },
];

export default function MobileBottomNav() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              router.pathname === item.path ||
              router.pathname.startsWith(item.path);

            return (
              <Link key={index} href={item.path}>
                <div className="flex flex-col items-center justify-center cursor-pointer">
                  <Icon
                    size={22}
                    className={`transition ${
                      isActive
                        ? "text-blue-600 scale-110"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs mt-1 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}