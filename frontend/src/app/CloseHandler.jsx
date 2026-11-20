import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hideMain, onAppEvent, quitApp } from "@/lib/tauri";
import { PREF, getPref, setPref } from "@/lib/prefs";

/**
 * Closing the main window. The first time, ask: keep running in the tray (quick search and folder watching keep
 * working) or quit. The answer is remembered and can be changed in Settings → "When you close the window".
 */
export function CloseHandler() {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const onClose = () => {
      const action = getPref(PREF.closeAction);
      if (action === "tray") hideMain();
      else if (action === "quit") quitApp();
      else setAsking(true);
    };
    const off = onAppEvent("close-requested", onClose);
    // Development only: lets design reviews and tests open this dialog in a normal browser tab.
    if (import.meta.env.DEV) window.addEventListener("smartspace:close-requested", onClose);
    return () => {
      off();
      if (import.meta.env.DEV) window.removeEventListener("smartspace:close-requested", onClose);
    };
  }, []);

  function choose(action) {
    setPref(PREF.closeAction, action);
    setAsking(false);
    if (action === "tray") hideMain();
    else quitApp();
  }

  return (
    <AlertDialog open={asking} onOpenChange={setAsking}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keep Smart Space running?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>
                In the tray, Smart Space keeps watching your folder and quick search (Alt+Space) keeps working. Open it
                again from the tray icon, or quit it there.
              </p>
              <p>Smart Space remembers your choice. You can change it in Settings.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => choose("quit")}>
            Quit Smart Space
          </Button>
          <Button autoFocus onClick={() => choose("tray")}>
            Keep running in the tray
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
