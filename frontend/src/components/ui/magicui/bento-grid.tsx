import { Button } from "@/components/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import { motion } from "framer-motion"
import { getGamesPlayedPortfolio } from "@/fetch";
import NumberTicker from "./number-ticker";
import { LangContext } from "@/context/LangContext";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  numberTicker,
  Icon,
  description,
  href,
  target,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  numberTicker?: boolean;
  Icon: any;
  description: string;
  href: string;
  target: string;
  cta: string;
}) => {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const { lang } = useContext(LangContext);

  useEffect(() => {
    const fetchGamesPlayed = async () => {
      setGamesPlayed(await getGamesPlayedPortfolio());
    }

    fetchGamesPlayed();
  }, []);

  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        className,
      )}
    >
      <div>{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-400 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">
          {numberTicker ?
            <>
              {lang === "pl" ? (
                <span>
                  W międzyczasie gram w rzutki w swoim pokoju, w 2023 roku stworzyłem aplikację internetową do darta i od tego czasu zagrałem <NumberTicker delay={0.18} value={gamesPlayed} /> gier.
                </span>
              ) : (
                <span>
                  In the meantime I play darts in my room, in 2023 I've created a web app for darts and since then I played <NumberTicker delay={0.18} value={gamesPlayed} /> games.
                </span>
              )}
            </>
            : description
          }
        </p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href} target={target}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  )
};

export { BentoCard, BentoGrid };
