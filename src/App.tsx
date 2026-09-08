/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AssetLoader } from './registry/AssetLoader';
import { Arena } from './components/Arena';
import { CommandCenter, ArenaConfig } from './components/CommandCenter';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [arenaConfig, setArenaConfig] = useState<ArenaConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    
    AssetLoader.preloadAll().then(() => {
      if (mounted) {
        // Check if green heli loaded successfully for Phase 2
        const green = AssetLoader.getAssetState('HELI_GREEN');
        if (green.status === 'ERROR') {
          setError(true);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Memuat aset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-rose-400">Gagal memuat aset helikopter. Periksa URL kanonikal.</p>
      </div>
    );
  }

  if (arenaConfig) {
    return <Arena config={arenaConfig} onReturnToMenu={() => setArenaConfig(null)} />; // Props will be added once Arena is modified in the next phase
  }

  return <CommandCenter onStart={setArenaConfig} />;
}


