export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Bienvenue sur The Doe For Athlete
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats Cards */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Joueurs actifs
          </h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            --
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ACWR Moyen
          </h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            --
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Alertes Prevention
          </h3>
          <p className="mt-2 text-3xl font-bold text-red-600">--</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Modules
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Utilisez la navigation pour acceder aux differents modules de la
          plateforme.
        </p>
      </div>
    </div>
  );
}
