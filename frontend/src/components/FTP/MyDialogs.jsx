import React, { useContext } from 'react'
import MyDialog from '../MyComponents/MyDialog'
import { Button } from '../ui/button'
import { Card, CardDescription, CardHeader } from '../ui/card'
import { formatDataSize } from './utils'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { FtpContext } from '@/context/FtpContext'

function MyDialogs(props) {
  const { dialogOpen, setDialogOpen, handleUpdateFile, handleCreateNewFolder, changingFileName, setChangingFileName, creatingFolder, setCreatingFolder } = props;
  const { activeFolders } = useContext(FtpContext);

  const handleDataPath = (file) => {
    if (file && dialogOpen.showInfo) {
      let path = "";
      activeFolders.map((folder) => {
        path = path + folder.name + " > "
      })

      return path + file.filename;
    }
  }

  return (
    <>
      {/* Changing File Name */}
      <MyDialog dialogOpen={dialogOpen.changeDataName} setDialogOpen={setDialogOpen} title="Change File Name" footer={
        <>
          <Button onClick={() => setDialogOpen((prev) => ({ ...prev, changeDataName: false }))} variant='secondary'>Cancel</Button>
          <Button onClick={handleUpdateFile} variant='outline_green'>Save</Button>
        </>
      }>
        <span className='flex flex-col gap-2'>
          {dialogOpen.data?.type === "file" && <Label>Original name: {dialogOpen.data?.metadata.originalFileName}</Label>}
          <Input placeholder={dialogOpen.data?.filename} value={changingFileName} onChange={(e) => setChangingFileName(e.target.value)} />
        </span>
      </MyDialog>

      {/* Showing Data Info */}
      <MyDialog dialogOpen={dialogOpen.showInfo} setDialogOpen={setDialogOpen} title={`${dialogOpen.data?.filename}`}>
        <Card>
          <CardHeader>
            Path:
            <CardDescription>{handleDataPath(dialogOpen.data)}</CardDescription>
          </CardHeader>
        </Card>
        <div className='p-4 flex gap-40'>
        {dialogOpen.data?.type === "file" && <div>
            <span className='text-slate-400'>Size:</span> <br />
            {formatDataSize(dialogOpen.data?.length)}
          </div>}
          {dialogOpen.data?.type === "file" && <div>
            <span className='text-slate-400'>
              Last modified:</span> <br />
            {new Date(dialogOpen.data?.lastModified).toLocaleString()}
          </div>}
        </div>
        <div className='p-4 py-0'>
          <span className='text-slate-400'>Date added:</span> <br />
          {new Date(dialogOpen.data?.uploadDate).toLocaleString()}
        </div>
      </MyDialog>

      {/* Creating folder */}
      <MyDialog dialogOpen={dialogOpen.createFolder} setDialogOpen={setDialogOpen} title="Create New Folder" footer={
        <>
          <Button onClick={() => setDialogOpen((prev) => ({ ...prev, createFolder: false }))} variant='secondary'>Cancel</Button>
          <Button onClick={handleCreateNewFolder} variant='outline_green'>Create</Button>
        </>
      }>
        <Input tabIndex={0} autoFocus required placeholder="Folder Name" value={creatingFolder} onChange={(e) => setCreatingFolder(e.target.value)} />
      </MyDialog>
    </>
  )
}

export default MyDialogs