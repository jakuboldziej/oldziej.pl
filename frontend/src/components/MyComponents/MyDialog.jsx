import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"

function MyDialog({ children, dialogOpen, setDialogOpen, title, footer }) {
  return (
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader className="text-white">
          <DialogTitle className='flex justify-center text-2xl'>{title}</DialogTitle>
          <DialogClose>
            <X onClick={() => setDialogOpen((prev) => ({ ...prev, changeFileName: false, showInfo: false }))} className="absolute right-2 top-2" />
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