"use client";
import { Code, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const TimelineIcon = ({ className = "w-6 h-6 text-primary" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 8H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12H10M6 16H10M14 12H18M14 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.getBoundingClientRect().height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="w-full font-sans md:px-10 bg-background"
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-card shadow-lg flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 transition-colors">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </motion.div>
        ))}
        
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

function timelineData(t: any): TimelineEntry[] {
  return [
    {
      title: t('Object1.Title'),
      icon: <TimelineIcon />,
      content: (
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {t('Object1.FeatureText')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2" />
                    {t('Object1.TextObject1')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('Object1.TextDescription1')}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2" /> 
                    {t('Object1.TextObject2')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('Object1.TextDescription2')}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2" /> 
                    {t('Object1.TextObject3')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('Object1.TextDescription3')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>
      ),
    },
    {
      title: t('Object2.Title'),
      icon: <Trophy className="w-6 h-6 text-primary" />,
      content: (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {t('Object2.FeatureText')}
            </h2>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={`problem-${i}`} className="bg-card border transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{t(`Object2.ProblemTitle${i}`)} </CardTitle>
                    <CardDescription>{t(`Object2.TextObject${i}`)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{t(`Object2.TextDescription${i}`)}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/problems/playground/${i}`}>
                      <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                        {t(`Object2.SolveText`)}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div> */}
          </div>
        </motion.section>
      ),
    },
    {
      title: t('Object3.Title'),
      icon: <Users className="w-6 h-6 text-primary" />,
      content: (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {t('Object3.FeatureText')}
            </h2>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <Card key={`contest-${i}`} className="bg-card border transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Weekly Contest</CardTitle>
                    <CardDescription>{t(`Object3.DateDescription${i}`)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{t(`Object3.TextDescription${i}`)}</p>
                    <p>{t(`Object3.AuthorDescription${i}`)}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={'#'}>
                      <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                        {t(`Object3.DetailText`)}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div> */}
          </div>
        </motion.section>
      ),
    },
    {
      title: t('Object4.Title'),
      icon: <Code className="w-6 h-6 text-primary" />,
      content: (
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20"
        >
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                {t('Object4.FeatureText')}
              </h1>
              <p className="text-xl mb-6 text-muted-foreground">{t('Object4.DescriptionText')}</p>
              <Link href="/problems">
                <Button size="lg" className="mr-4 hover:scale-105 transition-transform">
                  {t('Object4.CodingText')}
                </Button>
              </Link>
            </div>
            <motion.img 
              src="cat.svg" 
              alt="cat" 
              className="sepia hover:sepia-0 duration-300"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>
        </motion.section>
      ),
    }
  ]
}

export default function TimeScroll() {
  const t = useTranslations('Home.Timeline')
  return <Timeline data={timelineData(t)} />;
}