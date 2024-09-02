"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { PresentationChartBarIcon, TrophyIcon, UserIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center text-4xl font-bold mb-4">Sea Of Fortune: Battle For SFB 🏴‍☠</h1>
          <p className="text-center text-lg mb-6">
            "Sea of Fortune: Battle For SFB" es un emocionante juego de aventuras ambientado en los enigmáticos mares del Atlántico. Únete a la batalla por las esmeraldas y conquista el Reino de Esmeraldia.
          </p>

          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-4">
            <p className="font-medium">Dirección Conectada:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="bg-base-300 w-full px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-base-100 p-6 text-center items-center rounded-3xl shadow-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Compra Tokens SFB</h2>
              <p className="mb-4">Adquiere tokens SFB para participar en el juego y mejorar tus habilidades.</p>
              <Link href="/mint_token" passHref className="btn btn-primary">
                Comprar Tokens
              </Link>
            </div>
            <div className="bg-base-100 p-6 text-center items-center rounded-3xl shadow-lg">
              <UserIcon className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Únete a la Batalla</h2>
              <p className="mb-4">Únete a una sala de juego y comienza tu aventura por las esmeraldas.</p>
              <Link href="/game" passHref className="btn btn-primary">
                Jugar Ahora
              </Link>
            </div>
            <div className="bg-base-100 p-6 text-center items-center rounded-3xl shadow-lg">
              <PresentationChartBarIcon className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Estadísticas del Juego</h2>
              <p className="mb-4">Consulta las estadísticas de las salas y los jugadores.</p>
              <Link href="#" passHref className="btn btn-primary">
                Ver Estadísticas
              </Link>
            </div>
            <div className="bg-base-100 p-6 text-center items-center rounded-3xl shadow-lg">
              <TrophyIcon className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Historial de Ganadores</h2>
              <p className="mb-4">Mira quién ha ganado las batallas más recientes y su estrategia.</p>
              <Link href="#" passHref className="btn btn-primary">
                Ver Ganadores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
