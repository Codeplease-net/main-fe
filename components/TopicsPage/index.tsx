"use client";

import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Footer from '@/components/footer';
import { useTranslations } from 'next-intl';
import { Search, BookOpen, Filter, ArrowUpDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import categories from '@/utils/categories';

export default function TopicsPage() {
  const t = useTranslations('Topics');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [isFilterExpanded, setIsFilterExpanded] = React.useState(false);

  const handleSort = (type: string) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const filteredTopics = categories()
    .filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'All' || topic.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * multiplier;
      if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty) * multiplier;
      return 0;
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-800';
      case 'Intermediate': return 'bg-amber-100 text-amber-800';
      case 'Advanced': return 'bg-rose-100 text-rose-800';
      default: return '';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col space-y-8 mb-4">   
          <div className="flex flex-wrap justify-between items-center gap-4">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex flex-col space-y-2"
            >
              <h1 className="text-3xl font-bold md:text-4xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  {t('Topics')}
                </span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">{t('ExploreTopics')}</p>
            </motion.div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t('SearchTopics')}
                className="pl-10 transition-all border focus-visible:ring-primary"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('Filters')}
            </Button>
            
            <AnimatePresence>
              {isFilterExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-3 items-center"
                >
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-[180px] h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder={t('All Difficulties')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">{t('All Difficulties')}</SelectItem>
                      <SelectItem value="Beginner">{t('Beginner')}</SelectItem>
                      <SelectItem value="Intermediate">{t('Intermediate')}</SelectItem>
                      <SelectItem value="Advanced">{t('Advanced')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="gap-2 h-9"
                  >
                    <BookOpen className="w-4 h-4" />
                    {t('Name')}
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-primary' : ''}`} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort('difficulty')}
                    className="gap-2 h-9"
                  >
                    {t('Difficulty')}
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'difficulty' ? 'text-primary' : ''}`} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {selectedDifficulty !== 'All' && (
              <Badge variant="outline" className="gap-1 px-2 py-1">
                {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty('All')} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            
            <div className="ml-auto text-sm text-muted-foreground">
              {filteredTopics.length} {filteredTopics.length === 1 ? t('topic') : t('topics')}
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">{t('No topics found')}</h3>
              <p className="text-muted-foreground">{t('Try adjusting your search or filter')}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('All');
                }}
              >
                {t('Reset filters')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence>
                {filteredTopics.map((topic, index) => (
                  <motion.div
                    key={topic.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Link href={`/problems?categories=${topic.code.toLowerCase().replace(' ', '-')}`} className="h-full block">
                      <Card className="h-full hover:bg-muted/20 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border overflow-hidden group">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
                              {topic.name}
                            </CardTitle>
                            <Badge className={`${getDifficultyColor(topic.difficulty)} font-normal`}>
                              {t(topic.difficulty)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm text-foreground/70 mb-4 line-clamp-2">
                            {topic.description}
                          </CardDescription>
                          <div className="flex justify-end items-center text-sm text-primary font-medium">
                            {t('StartPracticing')}
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        <Footer />
      </motion.div>
    </>
  );
}