"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import Login from "@/components/login"
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from "framer-motion";

export default function BottomSection() {
  const t = useTranslations('Home.BottomSection')
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  
  const toggleLoginVisibility = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 text-primary-foreground py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-white/10 to-transparent rotate-12 transform scale-150" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-white/10 to-transparent -rotate-12 transform scale-150" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              {t('Title')}
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-primary-foreground/90">
              {t('Description')}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={toggleLoginVisibility}
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Solving
              </motion.span>
            </Button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {isLoginVisible && (
          <Login onClose={toggleLoginVisibility} redirectDes='/' isOpen={false} />
        )}
      </AnimatePresence>
    </div>
  )
}