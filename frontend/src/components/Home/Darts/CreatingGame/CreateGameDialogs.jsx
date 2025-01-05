import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";

function CreateGameDialogs({ props }) {
  const {
    customStartPoints,
    setCustomStartPoints,
    setSelectStartPoints,
    showCustomPoints,
    setShowCustomPoints,
    handleCustomStartPoints,
    showAddUser,
    setShowAddUser,
    newUser,
    setNewUser,
    handleAddingNewUser
  } = props;

  const handleCustomStartPointsChange = (value) => {
    if (value != 0) {
      const convertToNumber = Number(value);
      const convertToString = convertToNumber.toString();
      setCustomStartPoints(convertToString);
    }
  }

  const handleCancelCustomStartPoints = () => {
    setCustomStartPoints("0");
    setSelectStartPoints("501");
    setShowCustomPoints(false);
  }

  return (
    <>
      <Dialog open={showCustomPoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>Set Custom Points</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomStartPoints}>
            <div className='text-white'>
              <Input
                id="points"
                type="number"
                placeholder="12345"
                min={1}
                max={10000}
                value={customStartPoints}
                onChange={(e) => handleCustomStartPointsChange(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-6">
              <Button onClick={() => handleCancelCustomStartPoints()} type="button" variant="secondary">
                Close
              </Button>
              <Button disabled={customStartPoints <= 0} type="submit">Save changes</Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>

      <Dialog open={showAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>Add New Temporary User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddingNewUser}>
            <div className='text-white'>
              <Input
                id="user"
                type="text"
                placeholder="John Doe"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-6">
              <Button onClick={() => setShowAddUser(false)} type="button" variant="secondary">
                Close
              </Button>
              <Button disabled={newUser.trim() === ""} type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateGameDialogs