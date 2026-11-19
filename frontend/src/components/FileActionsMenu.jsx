import { useState } from "react";
import { ExternalLink, FolderSearch, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * "⋯" menu for a file: Open, Show in folder, Remove from Smart Space (with confirm) or Add back.
 * actions: {open(id), reveal(id), remove(id), addBack(id)} from useFileActions, wrapped by the page to show errors.
 */
export function FileActionsMenu({ fileId, name, removed, actions }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="file-menu size-7 text-muted-foreground"
            title="More"
            aria-label={`More actions for ${name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => actions.open(fileId)}>
            <ExternalLink /> Open
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => actions.reveal(fileId)}>
            <FolderSearch /> Show in folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {removed ? (
            <DropdownMenuItem onSelect={() => actions.addBack(fileId)}>
              <RotateCcw /> Add back to Smart Space
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
              <Trash2 /> Remove from Smart Space
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Smart Space forgets what it learned about this file (text, summary, tags) and will not read it again,
              so it no longer shows up in search or chat. The file itself stays where it is. You can add it back
              any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => actions.remove(fileId)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
