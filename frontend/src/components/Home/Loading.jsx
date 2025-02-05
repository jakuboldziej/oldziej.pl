import { Loader2 } from 'lucide-react'

function Loading() {
  return (
    <span className="flex justify-center w-full pt-3 text-white">
      <Loader2 className="h-10 w-10 animate-spin" />
    </span>
  )
}

export default Loading