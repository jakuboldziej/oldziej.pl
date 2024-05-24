import React, { useContext, useEffect } from 'react'
import MyDialog from '../MyComponents/MyDialog'
import { Button } from '../ui/button'
import { Card, CardDescription, CardHeader } from '../ui/card'
import { formatFileSize } from './utils'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { FtpContext } from '@/context/FtpContext'

function FileOptionsDialogs(props) {
  const { dialogOpen, setDialogOpen, handleUpdateFile, handleCreateNewFolder, changingFileName, setChangingFileName, creatingFolder, setCreatingFolder } = props;
  const { activeFolders } = useContext(FtpContext);

  const handleFilePath = (file) => {
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
      <MyDialog dialogOpen={dialogOpen.changeFileName} setDialogOpen={setDialogOpen} title="Change File Name" footer={
        <>
          <Button onClick={() => setDialogOpen((prev) => ({ ...prev, changeFileName: false }))} variant='secondary'>Cancel</Button>
          <Button onClick={handleUpdateFile} variant='outline_green'>Save</Button>
        </>
      }>
        <span className='flex flex-col gap-2'>
          <Label>Original name: {dialogOpen.file?.metadata.originalFileName}</Label>
          <Input placeholder={dialogOpen.file?.filename} value={changingFileName} onChange={(e) => setChangingFileName(e.target.value)} />
        </span>
      </MyDialog>

      {/* Showing File Info */}
      <MyDialog dialogOpen={dialogOpen.showInfo} setDialogOpen={setDialogOpen} title={`${dialogOpen.file?.filename}`}>
        <Card>
          <CardHeader>
            Ścieżka:
            <CardDescription>{handleFilePath(dialogOpen.file)}</CardDescription>
          </CardHeader>
        </Card>
        <div className='p-4 flex gap-40'>
          <div>
            <span className='text-slate-400'>Rozmiar:</span> <br />
            {formatFileSize(dialogOpen.file?.length)}
          </div>
          <div>
            <span className='text-slate-400'>Ostatnia zmiana:</span> <br />
            {new Date(dialogOpen.file?.lastModified).toLocaleString()}
          </div>
        </div>
        <div className='p-4 py-0'>
          <span className='text-slate-400'>Data Dodania:</span> <br />
          {new Date(dialogOpen.file?.uploadDate).toLocaleString()}
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

export default FileOptionsDialogs