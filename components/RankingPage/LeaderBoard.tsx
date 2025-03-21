'use client'

import { Link } from '@/i18n/routing';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Medal, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DotsLoader from '@/components/Problems/PlaygroundPage/components/DotsLoader';

interface LeaderboardEntry {
  username: string
  rating: number
  contestsJoined: number
  problemsSolved: number
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    username: 'codemaster',
    rating: 2800,
    contestsJoined: 50,
    problemsSolved: 500,
  },
  {
    username: 'algorithmguru',
    rating: 2750,
    contestsJoined: 45,
    problemsSolved: 480,
  },
  {
    username: 'pythonista',
    rating: 2600,
    contestsJoined: 40,
    problemsSolved: 450,
  },
  {
    username: 'webdev',
    rating: 2500,
    contestsJoined: 35,
    problemsSolved: 400,
  },
  {
    username: 'competitive_coder',
    rating: 2450,
    contestsJoined: 30,
    problemsSolved: 380,
  },
  {
    username: 'algorithm_master',
    rating: 2400,
    contestsJoined: 28,
    problemsSolved: 350,
  },
  {
    username: 'code_ninja',
    rating: 2350,
    contestsJoined: 25,
    problemsSolved: 320,
  },
  {
    username: 'debug_expert',
    rating: 2300,
    contestsJoined: 22,
    problemsSolved: 300,
  },
  {
    username: 'cpp_wizard',
    rating: 2250,
    contestsJoined: 20,
    problemsSolved: 280,
  },
  {
    username: 'java_champion',
    rating: 2200,
    contestsJoined: 18,
    problemsSolved: 260,
  },
  {
    username: 'python_master',
    rating: 2150,
    contestsJoined: 15,
    problemsSolved: 240,
  },
  {
    username: 'coding_beast',
    rating: 2100,
    contestsJoined: 12,
    problemsSolved: 220,
  },
  {
    username: 'algo_expert',
    rating: 2050,
    contestsJoined: 10,
    problemsSolved: 200,
  },
  {
    username: 'code_warrior',
    rating: 2000,
    contestsJoined: 8,
    problemsSolved: 180,
  },
  {
    username: 'binary_ninja',
    rating: 1950,
    contestsJoined: 6,
    problemsSolved: 160,
  }
]

const getRankIcon = (rank: number) => {
  return <span className="font-medium text-muted-foreground">{rank}</span>;
};

const getRatingColor = (rating: number) => {
  if (rating >= 2800) return 'text-red-500';
  if (rating >= 2600) return 'text-orange-500';
  if (rating >= 2400) return 'text-yellow-500';
  return 'text-green-500';
};

export default function LeaderboardTable() {
  const t = useTranslations('Leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Reduced loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLeaderboard = mockLeaderboard.filter(entry =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <DotsLoader size={12} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-4 px-2 sm:px-4"
    >
      <div className="flex flex-col space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-primary">
              {t('Leaderboard')}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Top performers in our coding community
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative w-full max-w-sm"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search username..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border rounded-lg overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-16">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Contests</TableHead>
                <TableHead className="text-center">Solved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {paginatedLeaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="text-center">
                      {getRankIcon(startIndex + index + 1)}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/profile/${entry.username}`} 
                        className="text-primary hover:underline font-medium"
                      >
                        {entry.username}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className={`font-bold ${getRatingColor(entry.rating)}`}
                      >
                        {entry.rating}
                      </motion.span>
                    </TableCell>
                    <TableCell className="text-center">{entry.contestsJoined}</TableCell>
                    <TableCell className="text-center">{entry.problemsSolved}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLeaderboard.length)} of {filteredLeaderboard.length}
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}