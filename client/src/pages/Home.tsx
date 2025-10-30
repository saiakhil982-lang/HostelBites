import { useQuery, useMutation } from "@tanstack/react-query";
import { MealCard } from "@/components/MealCard";
import { TutorialModal } from "@/components/TutorialModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { StatusResponse, Vote, MealType } from "@shared/schema";
import { Download, FileDown } from "lucide-react";

const mealConfig = {
  Breakfast: { emoji: "🥐", accentColor: "10 80% 65%" },
  Lunch: { emoji: "🍱", accentColor: "270 50% 65%" },
  Dinner: { emoji: "🍲", accentColor: "160 45% 55%" },
};

export default function Home() {
  const { toast } = useToast();

  const { data: status, isLoading } = useQuery<StatusResponse>({
    queryKey: ["/api/status"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: allNames = [] } = useQuery<string[]>({
    queryKey: ["/api/preset-names"],
  });

  const voteMutation = useMutation({
    mutationFn: async (vote: Vote) =>
      apiRequest("POST", "/api/vote", vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      toast({
        title: "Voted successfully!",
        description: "Your meal attendance has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetMealMutation = useMutation({
    mutationFn: async (meal: MealType) =>
      apiRequest("POST", `/api/reset/${meal}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      toast({
        title: "Reset successful",
        description: "Meal section has been reset.",
      });
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/reset-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      toast({
        title: "All meals reset",
        description: "All meal sections have been reset.",
      });
    },
  });

  const handleExportCSV = () => {
    window.location.href = "/api/export-csv";
  };

  const handleBackupFiles = () => {
    window.location.href = "/api/backup-files";
  };

  if (isLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-mint-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💖</div>
          <p className="text-lg font-medium text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-mint-50 dark:from-[hsl(280,35%,12%)] dark:to-[hsl(260,40%,8%)] p-6">
      <TutorialModal />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight flex items-center justify-center gap-3" data-testid="text-app-title">
            <span>HostelBites</span>
            <span>💖</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your daily meal attendance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackupFiles}
            data-testid="button-backup-files"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Backup Files
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => resetAllMutation.mutate()}
            disabled={resetAllMutation.isPending}
            data-testid="button-reset-all"
          >
            Reset All
          </Button>
        </div>

        {/* Meal Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(["Breakfast", "Lunch", "Dinner"] as MealType[]).map((meal) => (
            <MealCard
              key={meal}
              meal={meal}
              emoji={mealConfig[meal].emoji}
              eaten={status.meals[meal].eaten}
              notEaten={status.meals[meal].notEaten}
              allNames={allNames}
              accentColor={mealConfig[meal].accentColor}
              onVote={(name) => voteMutation.mutate({ name, meal })}
              onReset={() => resetMealMutation.mutate(meal)}
              isVoting={voteMutation.isPending}
            />
          ))}
        </div>

        {/* Summary Card */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-center">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Breakfast</p>
                <p className="text-2xl font-bold" data-testid="text-summary-breakfast">
                  {status.meals.Breakfast.eatenCount}/{allNames.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lunch</p>
                <p className="text-2xl font-bold" data-testid="text-summary-lunch">
                  {status.meals.Lunch.eatenCount}/{allNames.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dinner</p>
                <p className="text-2xl font-bold" data-testid="text-summary-dinner">
                  {status.meals.Dinner.eatenCount}/{allNames.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Made with 💖 for your hostel community
        </p>
      </div>
    </div>
  );
}
