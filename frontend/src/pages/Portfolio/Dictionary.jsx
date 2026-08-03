import { ScrollArea } from "@/components/ui/shadcn/scroll-area"
import { getQuotes } from "@/lib/fetch";
import { useEffect, useState } from "react";

function Dictionary() {
  const [quotes, setQuotes] = useState([]);

  const fetchData = async () => {
    const fetchedQuotes = await getQuotes("kubek");

    setQuotes(fetchedQuotes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='h-screen bg-black text-white flex flex-col items-center justify-center gap-20 pt-20'>
      <span className="text-4xl">Słownik Kubka</span>

      <ScrollArea className="text-xl flex-1">
        <div className="flex flex-col gap-3 text-center sm:px-20">
          {quotes.map((quote) => (
            <span key={quote._id}>
              <span className="font-semibold">
                {quote.description ? quote.title : `"${quote.title}"`}
              </span>
              {quote.description && (
                <>
                  <span> - </span>
                  <span>{quote.description}</span>
                </>
              )}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Dictionary