"use client"
import React from "react";
import { Spotlight } from "../ui/spotlight";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";

export default function SpotlightPreview() {
  const t = useTranslations('Home.Spotlight')
  return (
    <div className="min-h-[40rem] w-full rounded-md flex md:items-center md:justify-center antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary">
            CodePlease
            {/* <span className="block mt-2 text-4xl md:text-6xl">{t('Slogan')}</span> */}
          </h1>
          {/* <p className="mt-8 text-lg md:text-xl text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('Description')}
          </p> */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Link href="/problems">{t('Start Coding')}</Link>
              </Button>
            </motion.div>
            {/* <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-2 hover:bg-secondary/10 transition-all">
                <Link href="/contests">Join Contests</Link>
              </Button>
            </motion.div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
