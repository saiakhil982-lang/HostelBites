import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TutorialModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hostelbites-tutorial-seen");
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hostelbites-tutorial-seen", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-tutorial">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <span className="text-6xl">💖</span>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to HostelBites!
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-4">
            <p className="text-base">
              Track your meal attendance for Breakfast, Lunch, and Dinner.
            </p>
            <p>
              <strong>How to use:</strong>
            </p>
            <ol className="text-left space-y-2 pl-4">
              <li>1. Search for your name in any meal section</li>
              <li>2. Click "I've eaten" after you finish your meal</li>
              <li>3. See real-time updates of who's eaten</li>
              <li>4. Data auto-resets at midnight daily</li>
            </ol>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose} className="w-full" data-testid="button-close-tutorial">
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
