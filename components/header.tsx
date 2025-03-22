"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Shield, LockKeyhole } from "lucide-react";
import Login from "./login";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import logoheadwhite from "../public/logoheadwhite.png";
import logoheadblack from "../public/logoheadblack.png";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./ui/change-locale";
import { usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/api/Readfirebase";
import { Badge } from "./ui/badge";

// Define user role type
type UserRole = "user" | "admin" | "problem-setter" | null;

export default function Header() {
  const t = useTranslations("Header");
  const pathName = usePathname();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [Lightmode, setLightmode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userHandle, setUserHandle] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingHandle, setIsLoadingHandle] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Check if user is admin or problem-setter
  const isAdmin = userRole === "admin";
  const isProblemSetter = userRole === "problem-setter";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        setUserHandle("");
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    setIsLoadingHandle(true);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserHandle(userData.handle || "");
        
        // Check for role based on boolean flags in Firestore
        if (userData.admin === true) {
          setUserRole("admin");
        } else if (userData["problem-setter"] === true) {
          setUserRole("problem-setter");
        } else {
          setUserRole("user");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserRole("user"); // Default to user on error
    } finally {
      setIsLoadingHandle(false);
    }
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserHandle("");
        setUserRole(null);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light", Lightmode);
  }, [Lightmode]);

  return (
    <header className="border-b relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex justify-between items-center h-20 px-4">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center hover:opacity-90 transition-opacity"
        >
          <Image
            src={Lightmode ? logoheadwhite : logoheadblack}
            height={48}
            alt="logo-head"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {["home", "problems", "topics"].map((route, index) => (
            <Link
              key={index}
              href={route == 'home' ? '/' : `/${route}`}
              className={`text-lg px-4 py-2 rounded-md transition-all duration-200 ${
                pathName.includes(route)
                  ? "bg-secondary text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-primary"
              }`}
            >
              {t(route.charAt(0).toUpperCase() + route.slice(1))}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <LocaleSwitcher />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLightmode(!Lightmode)}
              className="hover:bg-secondary/80"
            >
              {Lightmode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    {/* Show role badge next to avatar */}
                    {isAdmin && (
                      <Badge variant="outline" className="bg-primary/10 gap-1">
                        <Shield className="h-3 w-3" />
                        {t('Admin')}
                      </Badge>
                    )}
                    {isProblemSetter && (
                      <Badge variant="outline" className="bg-primary/10 gap-1">
                        <LockKeyhole className="h-3 w-3" />
                        {t('ProblemSetter')}
                      </Badge>
                    )}
                    <Avatar>
                      <AvatarImage src="/cat.png" />
                      <AvatarFallback>{isLoadingHandle ? "..." : (userHandle.charAt(0) || "U")}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-medium">
                    {isLoadingHandle ? "Loading..." : userHandle || "User"}
                  </DropdownMenuLabel>
                  
                  {/* Admin and problem-setter get access to problems bank */}
                  {(isAdmin || isProblemSetter) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/problems-bank" className="w-full">
                          {isProblemSetter ? t("My Problems") : t("Problems Bank")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Admin-only menu items */}
                  {isAdmin && (
                    <>
                    <DropdownMenuItem>
                      <Link href="/logs" className="w-full">
                        {t("Logs")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/users-management" className="w-full">
                        {t("Users Management")}
                      </Link>
                    </DropdownMenuItem>
                    </>
                    
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>{t("Sign Out")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="secondary" 
              onClick={() => window.location.href = "/login"}
              className="font-medium">
                {t("Sign In")}
              </Button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[80px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b md:hidden z-50">
          <div className="flex flex-col p-4 space-y-3">
            {["home", "problems", "leaderboard", "topics"].map((route, index) => (
              <Link
                key={index}
                href={route == 'home' ? '/' : `/${route}`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  pathName.includes(route)
                    ? "bg-secondary text-primary"
                    : "hover:bg-secondary/80"
                }`}
              >
                {t(route.charAt(0).toUpperCase() + route.slice(1))}
              </Link>
            ))}
            
            {/* Add problems bank link for admin/problem-setter in mobile menu */}
            {(isAdmin || isProblemSetter) && (
              <Link
                href="/problems-bank"
                className="px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                {isAdmin ? (
                  <Shield className="h-4 w-4" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {isProblemSetter ? t("My Problems") : t("Problems Bank")}
              </Link>
            )}
            
            <div className="flex items-center justify-between gap-3 px-4 pt-3 border-t">
              <LocaleSwitcher />
              <Button variant="outline" size="icon" onClick={() => setLightmode(!Lightmode)}>
                {Lightmode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-2">
                    {/* Show role badge in mobile menu */}
                    {isAdmin && (
                      <Badge variant="outline" className="bg-primary/10 gap-1">
                        <Shield className="h-3 w-3" />
                        {t('Admin')}
                      </Badge>
                    )}
                    {isProblemSetter && (
                      <Badge variant="outline" className="bg-primary/10 gap-1">
                        <LockKeyhole className="h-3 w-3" />
                        {t('ProblemSetter')}
                      </Badge>
                    )}
                    <Avatar>
                      <AvatarImage src="/cat.png" />
                      <AvatarFallback>{isLoadingHandle ? "..." : (userHandle.charAt(0) || "U")}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    {isLoadingHandle ? "Loading..." : userHandle || "User"}
                  </DropdownMenuLabel>
                  
                  {isAdmin && (
                    <>
                    <DropdownMenuItem>
                      <Link href="/logs" className="w-full">
                        {t("Logs")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/users-management" className="w-full">
                        {t("Users Management")}
                      </Link>
                    </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={handleLogout}>{t("Sign Out")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="secondary" 
              onClick={() => window.location.href = "/login"}
              >
                {t("Sign In")}
              </Button>
            )}
          </div>
        </div>
      )}

      <Login isOpen={isLoginVisible} onClose={() => setIsLoginVisible(false)} redirectDes="/problems" />
    </header>
  );
}