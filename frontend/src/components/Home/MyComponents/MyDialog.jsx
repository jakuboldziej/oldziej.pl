import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";

function MyDialog({ children, dialogOpen, setDialogOpen, title, footer }) {
  const handleDialogClose = (event) => {
    if (event === false) {
      setDialogOpen((prev) => ({ ...prev, changeDataName: false, showInfo: false, createFolder: false }))
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(e) => handleDialogClose(e)}>
      <DialogContent>
        <DialogHeader className="text-white">
          <DialogTitle className='flex justify-center text-2xl'>{title}</DialogTitle>
          <DialogClose className="z-50">
            <X className="absolute right-2 top-2 z-50" />
          </DialogClose>
        </DialogHeader>
        <div className="text-white">
          {children}
        </div>
        <DialogFooter className="text-white">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MyDialog