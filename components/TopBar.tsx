import { User, ArrowLeft, GitBranch, ChevronDown } from 'lucide-react';
import LocationMapIcon from '@/components/imports/LocationMapAppStreetStreamlineMicroLine';
import { useState } from 'react';

interface TopBarProps {
  variant?: 'list' | 'project';
  onNavigateToList?: () => void;
  currentVariant?: string;
  onVariantChange?: (variant: string) => void;
  rotationTitle?: string;
  activeView?: 'my-systems' | 'explore';
  onViewChange?: (view: 'my-systems' | 'explore') => void;
}

export function TopBar({ variant = 'list', onNavigateToList, currentVariant = 'Originale', onVariantChange, rotationTitle = 'Rotation Bio 2027-2033', activeView = 'my-systems', onViewChange }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const variants = ['Originale', 'Variante 1'];

  // Version simple avec logo pour la page liste
  if (variant === 'list') {
    return (
      <nav className="bg-[#6b9571] shadow-md sticky top-0 z-50">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="size-10 text-gray-800">
                <LocationMapIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xl leading-tight">Itinéra</span>
                <span className="text-white/80 text-xs">simulateur d'itinéraire technique</span>
              </div>
            </div>

            {/* Toggle Navigation */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
              <button
                onClick={() => onViewChange && onViewChange('my-systems')}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeView === 'my-systems'
                    ? 'bg-white text-[#6b9571] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Mes Systèmes
              </button>
              <button
                onClick={() => onViewChange && onViewChange('explore')}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeView === 'explore'
                    ? 'bg-white text-[#6b9571] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Explorer d'autres systèmes
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <span className="text-white text-sm">Conseiller Agronomique</span>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-1 py-1 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-white">Marie Dubois</span>
                <div className="bg-[#f5f5f0] rounded-full size-8 flex items-center justify-center">
                  <User className="size-5 text-[#6b9571]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Version complète pour la page projet
  return (
    <nav className="bg-[#6b9571] shadow-md sticky top-0 z-50">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navigation and Rotation Selector */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              className="flex items-center justify-center size-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              onClick={() => onNavigateToList ? onNavigateToList() : window.history.back()}
            >
              <ArrowLeft className="size-5 text-white" />
            </button>

            {/* Rotation Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors min-w-[250px]"
              >
                <span className="text-white flex-1 text-left">{rotationTitle}-{currentVariant}</span>
                <ChevronDown className="size-4 text-white" />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[250px] z-50">
                  {variants.map((variantName) => (
                    <button
                      key={variantName}
                      onClick={() => {
                        onVariantChange && onVariantChange(variantName);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                        variantName === currentVariant ? 'bg-[#6b9571]/10 text-[#6b9571]' : 'text-gray-700'
                      }`}
                    >
                      {rotationTitle}-{variantName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Variant Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              onClick={() => alert('Fonctionnalité de création de variante en cours de développement')}
            >
              <GitBranch className="size-4 text-white" />
              <span className="text-white">Créer une variante</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">Conseiller Agronomique</span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-1 py-1 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
              <span className="text-white">Marie Dubois</span>
              <div className="bg-[#f5f5f0] rounded-full size-8 flex items-center justify-center">
                <User className="size-5 text-[#6b9571]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}