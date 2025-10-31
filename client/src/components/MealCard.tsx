import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import type { MealType } from "@shared/schema";

interface MealCardProps {
  meal: MealType;
  emoji: string;
  eaten: string[];
  notEaten: string[];
  allNames: string[];
  accentColor: string;
  onVote: (name: string) => void;
  onReset: () => void;
  isVoting: boolean;
}

export function MealCard({
  meal,
  emoji,
  eaten,
  notEaten,
  allNames,
  accentColor,
  onVote,
  onReset,
  isVoting,
}: MealCardProps) {
  const [selectedName, setSelectedName] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleVote = () => {
    if (!selectedName) return;
    
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: [accentColor],
    });
    
    onVote(selectedName);
    setSelectedName("");
    setSearchValue("");
  };

  const percentage = allNames.length > 0 
    ? Math.round((eaten.length / allNames.length) * 100) 
    : 0;

  const filteredNames = searchValue
    ? allNames.filter(name => 
        name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : allNames;

  return (
    <motion.div initial={{ opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} whileHover={{ y: -10, scale: 1.01 }}>
      <Card 
        className="overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, hsl(${accentColor}) 0%, hsl(${accentColor} / 0.1) 100%)`,
          backdropFilter: "blur(6px)",
        }}
        data-testid={`card-meal-${meal.toLowerCase()}`}
      >
        {/* Chef mascot removed as requested */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span className="text-4xl inline-block" animate={{ y: [0, -2, 0, 2, 0], rotate: [0, -4, 0, 4, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>{emoji}</motion.span>
            <h2 className="text-xl font-semibold" data-testid={`text-meal-name-${meal.toLowerCase()}`}>
              {meal}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            data-testid={`button-reset-${meal.toLowerCase()}`}
            className="text-xs"
          >
            Reset
          </Button>
        </div>
        
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={eaten.length}
                className="text-4xl font-bold tabular-nums"
                data-testid={`text-eaten-count-${meal.toLowerCase()}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {eaten.length}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-muted-foreground">
              {notEaten.length} yet to eat
            </span>
          </div>
          <Progress value={percentage} className="h-2" data-testid={`progress-${meal.toLowerCase()}`} />
          <p className="text-xs text-muted-foreground">{percentage}% completed</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            list={`names-${meal}`}
            placeholder="Search your name..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setSelectedName(e.target.value);
            }}
            onBlur={() => {
              // Check if the typed value matches a name
              const exactMatch = allNames.find(
                name => name.toLowerCase() === searchValue.toLowerCase()
              );
              if (exactMatch) {
                setSelectedName(exactMatch);
              }
            }}
            className="w-full"
            data-testid={`input-name-search-${meal.toLowerCase()}`}
              inputMode="text"
              autoCapitalize="words"
              autoComplete="name"
          />
          <datalist id={`names-${meal}`}>
            {filteredNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          
          <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }} className="w-full">
            <Button
              onClick={handleVote}
              disabled={!selectedName || isVoting || eaten.includes(selectedName)}
              className="w-full flex items-center justify-center gap-2"
              data-testid={`button-vote-${meal.toLowerCase()}`}
            >
              <motion.span aria-hidden animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>👋</motion.span>
              {eaten.includes(selectedName) ? "Already voted!" : "I've eaten"}
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Who Ate ({eaten.length})</h3>
            <ScrollArea className="h-40 rounded-lg border p-2" data-testid={`scroll-who-ate-${meal.toLowerCase()}`}>
              <div className="space-y-1">
                {eaten.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No one yet</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {eaten.map((name) => (
                      <motion.div key={name} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="inline-block">
                        <Badge 
                          variant="secondary" 
                          className="mr-1 mb-1 text-xs"
                          data-testid={`badge-eaten-${name}`}
                        >
                          {name}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Not Eaten Yet ({notEaten.length})</h3>
            <ScrollArea className="h-40 rounded-lg border p-2" data-testid={`scroll-not-eaten-${meal.toLowerCase()}`}>
              <div className="space-y-1">
                {notEaten.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Everyone ate!</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {notEaten.map((name) => (
                      <motion.div key={name} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="inline-block">
                        <Badge 
                          variant="outline" 
                          className="mr-1 mb-1 text-xs"
                          data-testid={`badge-not-eaten-${name}`}
                        >
                          {name}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      </Card>
    </motion.div>
  );
}
