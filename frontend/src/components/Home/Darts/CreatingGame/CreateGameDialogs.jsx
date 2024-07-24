import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";

function CreateGameDialogs({ props }) {
  const {
    customStartPoints,
    setCustomStartPoints,
    showCustomPoints,
    setShowCustomPoints,
    handleCustomStartPoints,
    showAddUser,
    setShowAddUser,
    newUser,
    setNewUser,
    handleAddingNewUser
  } = props;
  return (
    <>
      <Dialog open={showCustomPoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>Set Custom Points</DialogTitle>
          </DialogHeader>
          <div className='text-white'>
            <Input
              id="points"
              type="number"
              placeholder="12345"
              min={1}
              max={10000}
              onChange={(e) => setCustomStartPoints(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCustomPoints(false)} type="submit" variant="secondary">
              Close
            </Button>
            <Button disabled={customStartPoints <= 0} onClick={handleCustomStartPoints} type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>Add New Temporary User</DialogTitle>
          </DialogHeader>
          <div className='text-white'>
            <Input
              id="user"
              type="text"
              placeholder="John Doe"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAddUser(false)} type="submit" variant="secondary">
              Close
            </Button>
            <Button disabled={newUser.trim() === ""} onClick={handleAddingNewUser} type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateGameDialogs