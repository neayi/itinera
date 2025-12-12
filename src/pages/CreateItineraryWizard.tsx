import { ArrowLeft, Loader2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { useState, useEffect } from 'react';

interface CreateItineraryWizardProps {
  onBack: () => void;
  onComplete?: (projectId: string) => void;
}

export function CreateItineraryWizard({ onBack, onComplete }: CreateItineraryWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setIsGenerating(false);
        // Rediriger vers la page de détails avec un ID de projet
        if (onComplete) {
          onComplete('1'); // ID du projet de démo
        }
      }, 2500); // 2.5 secondes

      return () => clearTimeout(timer);
    }
  }, [isGenerating, onComplete]);

  const handleNextClick = () => {
    if (currentStep === 3) {
      setIsGenerating(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <TopBar variant="list" />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-gray-900">Créer un nouveau système</h1>
            <p className="text-gray-600 text-sm mt-1">Étape {currentStep} sur 3</p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-[#6b9571]' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-[#6b9571]' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${currentStep >= 3 ? 'bg-[#6b9571]' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        {/* Contenu de l'étape 1 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-gray-900 mb-6">Informations générales</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Nom du système
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rotation Bio 2027-2033"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Surface (ha) de la ou des parcelles concernées
                </label>
                <input
                  type="number"
                  placeholder="Ex: 15.5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Donnez un nom à cette surface
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parcelle Nord, Champ du Moulin..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Précisez le type de sol
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent bg-white"
                >
                  <option value="">Sélectionnez un type de sol</option>
                  <option value="argileux">Argileux</option>
                  <option value="limoneux">Limoneux</option>
                  <option value="sableux">Sableux</option>
                  <option value="calcaire">Calcaire</option>
                  <option value="hydromorphe">Hydromorphe</option>
                  <option value="argilo-limoneux">Argilo-limoneux</option>
                  <option value="sablo-limoneux">Sablo-limoneux</option>
                  <option value="argilo-calcaire">Argilo-calcaire</option>
                  <option value="tourbeux">Tourbeux</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez brièvement le cahier des charges de ce système (bio, TCS, cahier des charges industrielle spécifique...)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contenu de l'étape 2 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">
                  Décrivez-nous votre système actuel
                </label>
                <button
                  type="button"
                  onClick={() => setShowExampleModal(true)}
                  className="text-[#6b9571] hover:text-[#5a8560] text-sm underline"
                >
                  Exemples de description
                </button>
              </div>
              <textarea
                placeholder="Décrivez brièvement votre système (rotation des cultures principales, intervention, potentiel des adventices,...)"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Contenu de l'étape 3 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-gray-900 mb-6">Localisation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Adresse de la parcelle
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123 Route de Toulouse, 31000 Toulouse"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b9571] focus:border-transparent"
                />
              </div>

              <div className="bg-[#f5f5f0] border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-gray-700 text-sm">
                  Nous avons besoin de cette information pour générer :
                </p>
                <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                  <li>• Un diagramme ombrothermique,</li>
                  <li>• Une première estimation des propriétés du sol.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex items-center justify-between mt-8">
          {currentStep === 1 ? (
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>
          )}
          <button
            onClick={handleNextClick}
            className="px-6 py-2 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
          >
            {currentStep === 3 ? 'Génération d\'un brouillon de système' : 'Suivant'}
          </button>
        </div>
      </div>

      {/* Modal de génération */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="size-16 text-[#6b9571] animate-spin mx-auto mb-4" />
            <p className="text-gray-900 text-lg">Génération en cours...</p>
          </div>
        </div>
      )}

      {/* Modal d'exemples */}
      {showExampleModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50" onClick={() => setShowExampleModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-gray-900 mb-4">Exemples de description</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Lupin (350 kg/ha) + Orge (50 kg/ha) dans la ligne de semis après un labour, puis semis à la volée avec le combiné : Luzerne, Trèfle violet, Trèfle blanc, puis semis à 100kg/ha, au combiné : Herse rotative, Ligne de semis, puis Quinoa avec labour avant le semis, éventuellement un vibro ou rouleau si le sol est séchant, etc.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowExampleModal(false)}
                className="px-6 py-2 bg-[#6b9571] text-white rounded-lg hover:bg-[#5a8560] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}