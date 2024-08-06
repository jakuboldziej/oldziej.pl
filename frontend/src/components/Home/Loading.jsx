import { Loader2 } from 'lucide-react'

function Loading() {
  return (
    <div className="flex justify-center w-100 pt-3 text-white">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  )
}

export default Loading