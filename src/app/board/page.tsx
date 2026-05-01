'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore, type Board } from '@/store';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, MoreHorizontal, Trash2, Clock, FolderOpen, Share2 } from 'lucide-react';

export default function BoardPage() {
  const router = useRouter();
  const { boards, addBoard, deleteBoard } = useAppStore();
  const [activeTab, setActiveTab] = useState('recent');

  const handleCreateBoard = () => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: `Yeni Pano ${boards.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail: '',
      storyFrames: [],
    };
    addBoard(newBoard);
    router.push(`/board/${newBoard.id}`);
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteBoard(boardId);
  };

  const sortedBoards = [...boards].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const renderBoardCard = (board: Board, index: number) => (
    <motion.div
      key={board.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/board/${board.id}`} className="group block">
        <div className="relative rounded-xl border border-[#2A2A2A] bg-[#141414] hover:border-purple-500/40 transition-all duration-200 overflow-hidden">
          {/* Mosaic thumbnail */}
          <div className="aspect-video grid grid-cols-2 grid-rows-2 gap-0.5 p-2">
            <div className="rounded-md bg-gradient-to-br from-purple-600/30 to-purple-900/30" />
            <div className="rounded-md bg-gradient-to-br from-blue-600/30 to-blue-900/30" />
            <div className="rounded-md bg-gradient-to-br from-emerald-600/30 to-emerald-900/30" />
            <div className="rounded-md bg-gradient-to-br from-amber-600/30 to-amber-900/30" />
          </div>

          {/* Board info */}
          <div className="p-3 pt-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white truncate">
                  {board.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(board.updatedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteBoard(e, board.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Board" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-[#141414] border border-[#2A2A2A]">
              <TabsTrigger value="recent" className="gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Son Goruntulenmeler
              </TabsTrigger>
              <TabsTrigger value="mine" className="gap-1.5 text-xs">
                <FolderOpen className="w-3.5 h-3.5" />
                Panolarim
              </TabsTrigger>
              <TabsTrigger value="shared" className="gap-1.5 text-xs">
                <Share2 className="w-3.5 h-3.5" />
                Benimle Paylasilanlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <BoardGrid
                boards={sortedBoards}
                renderBoardCard={renderBoardCard}
                onCreateBoard={handleCreateBoard}
              />
            </TabsContent>

            <TabsContent value="mine">
              <BoardGrid
                boards={sortedBoards}
                renderBoardCard={renderBoardCard}
                onCreateBoard={handleCreateBoard}
              />
            </TabsContent>

            <TabsContent value="shared">
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center mb-4">
                  <Share2 className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="text-white font-medium mb-1">Henuz paylasim yok</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Takim arkadaslariniz size pano paylastiginda burada goruntuleyebilirsiniz.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function BoardGrid({
  boards,
  renderBoardCard,
  onCreateBoard,
}: {
  boards: Board[];
  renderBoardCard: (board: Board, index: number) => React.ReactNode;
  onCreateBoard: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* New board card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onCreateBoard}
          className="w-full group block rounded-xl border border-dashed border-[#2A2A2A] hover:border-purple-500/50 bg-[#141414]/50 hover:bg-[#1E1E1E] transition-all duration-200"
        >
          <div className="aspect-video flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-all">
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
              Yeni Pano Olustur
            </span>
          </div>
        </button>
      </motion.div>

      {/* Board cards */}
      {boards.map((board, i) => renderBoardCard(board, i))}
    </div>
  );
}
