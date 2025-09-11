import { ScrollArea } from "@/components/ui/shadcn/scroll-area"

function Dictionary() {

  return (
    <div className='h-screen bg-black text-white flex flex-col items-center justify-center gap-20 pt-20'>
      <span className="text-4xl">Słownik Kubka</span>

      <ScrollArea className="text-xl flex-1">
        <div className=" flex flex-col gap-3 text-center sm:px-20">
          <span>
            <span className="font-semibold">Kamiatek</span>
            <span> - osoba, która nie chce wejść na voice chat na discordzie.</span>
          </span>

          <span>
            <span className="font-semibold">Rudzki kierwa vinotinto</span>
            <span> - Rudy (Rafał) zwyzywany w nawiązaniu do ekipy breakowej vinotinto, w której każdy bboy jest wysoki.</span>
          </span>

          <span>
            <span className="font-semibold">Pomerdało Cię?</span>
            <span> - inaczej: pojebało Cię?.</span>
          </span>
        </div>

      </ScrollArea>
    </div>
  )
}

export default Dictionary