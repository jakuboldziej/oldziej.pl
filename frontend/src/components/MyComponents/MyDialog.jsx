import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"

function MyDialog({ children, dialogOpen, setDialogOpen, title, footer }) {
  return (
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader className="text-white">
          <DialogTitle className='flex justify-center text-2xl'>{title}</DialogTitle>
          <DialogClose>
            <X onClick={() => setDialogOpen((prev) => ({ ...prev, changeFilename: false }))} className="absolute right-1 top-1"/>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="text-white">
          {children}
        </DialogDescription>
        <DialogFooter className="text-white">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MyDialog