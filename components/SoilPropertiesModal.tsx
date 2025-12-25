import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import svgPaths from '@/components/imports/svg-ho7dh4ilft';

interface SoilPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoilPropertiesModal({ isOpen, onClose }: SoilPropertiesModalProps) {
  const [expandedPhysical, setExpandedPhysical] = useState(true);
  const [expandedChemical, setExpandedChemical] = useState(true);

  // Physical properties state
  const [texture, setTexture] = useState('Limon argileux');
  const [profondeur, setProfondeur] = useState('80 cm');
  const [drainage, setDrainage] = useState('Bon');
  const [porosite, setPorosite] = useState('45%');
  const [reserveUtile, setReserveUtile] = useState('150 mm');

  // Chemical properties state
  const [ph, setPh] = useState('6.8');
  const [matiereOrganique, setMatiereOrganique] = useState('2.8%');
  const [azoteTotal, setAzoteTotal] = useState('0.15%');
  const [phosphore, setPhosphore] = useState('65 mg/kg');
  const [potassium, setPotassium] = useState('185 mg/kg');
  const [cec, setCec] = useState('18 cmol/kg');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-[10px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] w-[448px] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-[24px] p-[24px]">
          {/* Heading */}
          <div>
            <p className="font-bold text-[18px] leading-[24px] text-[#101828]">
              Propriété du sol
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-[14px] leading-[24px] text-[#101828]">
              <span>Les données sont issues du site </span>
              <a href="https://soilgrids.org" target="_blank" rel="noopener noreferrer" className="text-[#4a6ad4] underline decoration-solid">
                soilgrids.org
              </a>
              <span> sur la base de l'adresse que vous avez fournie.</span>
            </p>
          </div>

          {/* Physical Properties Section */}
          <button
            onClick={() => setExpandedPhysical(!expandedPhysical)}
            className="flex items-center justify-between w-full"
          >
            <p className="text-[14px] leading-[20px] text-center text-neutral-950">Propriétés physiques</p>
            {expandedPhysical ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {/* Physical Properties */}
          {expandedPhysical && (
            <div className="flex flex-col gap-[16px]">
              {/* Texture */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Texture</p>
                <input
                  type="text"
                  value={texture}
                  onChange={(e) => setTexture(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Profondeur */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Profondeur</p>
                <input
                  type="text"
                  value={profondeur}
                  onChange={(e) => setProfondeur(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Drainage */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Drainage</p>
                <input
                  type="text"
                  value={drainage}
                  onChange={(e) => setDrainage(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Porosité */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Porosité</p>
                <input
                  type="text"
                  value={porosite}
                  onChange={(e) => setPorosite(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Réserve utile */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Réserve utile</p>
                <input
                  type="text"
                  value={reserveUtile}
                  onChange={(e) => setReserveUtile(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>
            </div>
          )}

          {/* Chemical Properties Section */}
          <button
            onClick={() => setExpandedChemical(!expandedChemical)}
            className="flex items-center justify-between w-full"
          >
            <p className="text-[14px] leading-[20px] text-center text-neutral-950">Propriétés chimiques</p>
            {expandedChemical ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {/* Chemical Properties */}
          {expandedChemical && (
            <div className="flex flex-col gap-[16px]">
              {/* pH */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">pH</p>
                <input
                  type="text"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Matière organique */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Matière organique</p>
                <input
                  type="text"
                  value={matiereOrganique}
                  onChange={(e) => setMatiereOrganique(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Azote total */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Azote total</p>
                <input
                  type="text"
                  value={azoteTotal}
                  onChange={(e) => setAzoteTotal(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Phosphore (P2O5) */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Phosphore (P2O5)</p>
                <input
                  type="text"
                  value={phosphore}
                  onChange={(e) => setPhosphore(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* Potassium (K2O) */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">Potassium (K2O)</p>
                <input
                  type="text"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>

              {/* CEC */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[20px] text-[#4a5565]">CEC</p>
                <input
                  type="text"
                  value={cec}
                  onChange={(e) => setCec(e.target.value)}
                  className="rounded-[4px] border border-[#ebebeb] px-[10px] py-[4px] text-[14px] leading-[20px] text-neutral-950 w-[200px]"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-[12px] items-center justify-end w-full">
            {/* Annuler Button */}
            <button
              onClick={onClose}
              className="bg-white h-[40px] rounded-[10px] border border-gray-200 flex gap-[8px] items-center justify-center pl-[12px] pr-[16px] hover:bg-gray-50 transition-colors"
            >
              <svg className="size-[18px]" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.p3b6da800} fill="#707070" />
              </svg>
              <p className="text-[14px] text-[#707070]">Annuler</p>
            </button>

            {/* Valider Button */}
            <button
              onClick={onClose}
              className="bg-[#6b9571] h-[40px] rounded-[10px] flex gap-[12px] items-center px-[16px] hover:bg-[#5a8560] transition-colors"
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.pd9ec680} fill="white" />
              </svg>
              <p className="text-[16px] text-white leading-[24px]">Valider</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}