import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

interface ManageNamesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageNamesModal({ open, onOpenChange }: ManageNamesModalProps) {
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  const { data: names = [], isLoading } = useQuery<string[]>({
    queryKey: ["/api/preset-names"],
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) =>
      apiRequest("POST", "/api/names", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preset-names"] });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      setNewName("");
      toast({
        title: "Name added!",
        description: "The new name has been added successfully.",
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

  const updateMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) =>
      apiRequest("PUT", `/api/names/${encodeURIComponent(oldName)}`, { newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preset-names"] });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      setEditingName(null);
      setEditValue("");
      toast({
        title: "Name updated!",
        description: "The name has been updated successfully.",
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

  const deleteMutation = useMutation({
    mutationFn: async (name: string) =>
      apiRequest("DELETE", `/api/names/${encodeURIComponent(name)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preset-names"] });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      toast({
        title: "Name deleted",
        description: "The name has been removed.",
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

  const handleAdd = () => {
    if (newName.trim()) {
      addMutation.mutate(newName.trim());
    }
  };

  const handleEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const handleSaveEdit = () => {
    if (editingName && editValue.trim()) {
      updateMutation.mutate({ oldName: editingName, newName: editValue.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setEditValue("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]" data-testid="dialog-manage-names">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Resident Names</DialogTitle>
          <DialogDescription>
            Add, edit, or remove resident names from the list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Name */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              data-testid="input-new-name"
            />
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || addMutation.isPending}
              data-testid="button-add-name"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Names List */}
          <ScrollArea className="h-[400px] rounded-lg border p-4" data-testid="scroll-names-list">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : names.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No names yet. Add your first resident!
              </div>
            ) : (
              <div className="space-y-2">
                {names.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 p-2 rounded-lg hover-elevate active-elevate-2 border"
                    data-testid={`name-item-${name}`}
                  >
                    {editingName === name ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1"
                          data-testid={`input-edit-${name}`}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={!editValue.trim() || updateMutation.isPending}
                          data-testid={`button-save-${name}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          data-testid={`button-cancel-${name}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium" data-testid={`text-name-${name}`}>
                          {name}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(name)}
                          data-testid={`button-edit-${name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="text-sm text-muted-foreground text-center">
            Total: {names.length} residents
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
