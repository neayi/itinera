import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { InterventionData } from '@/lib/types';
import svgPaths from '@/components/imports/svg-abbk4gof4j';
import svgPathsBreadcrumb from '@/components/imports/svg-cr1okqcvbh';

interface ChatBotProps {
  interventions: InterventionData[];
  setInterventions: React.Dispatch<React.SetStateAction<InterventionData[]>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  focusedCell?: {
    interventionName: string;
    columnName: string;
  } | null;
  contextualMessages?: Message[];
  onAddContextualMessage?: (message: Message) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatBot({ interventions, setInterventions, isOpen, setIsOpen, focusedCell, contextualMessages = [], onAddContextualMessage }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant de simulation d\'itinéraires techniques. Vous pouvez me demander de :\n\n• Corriger les montants ou temps de travail\n• Ajuster la rotation et les interventions\n• Faire des simulation de changement de cahier des charges\n• Etudier les stratégies vis à vis du ray-grass ou de la fusariose\n\nComment puis-je vous aider ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // If in contextual mode, add to contextual messages
    if (focusedCell && onAddContextualMessage) {
      // Add user message to contextual messages via parent
      onAddContextualMessage(userMessage);

      setInput('');
      setIsTyping(true);

      // Simulate AI response for contextual mode
      setTimeout(() => {
        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Entendu, je vais historiser ce commentaire afin que vous puissiez le retrouver ensuite.',
          timestamp: new Date()
        };

        onAddContextualMessage(assistantResponse);
        setIsTyping(false);
      }, 1000);

      return;
    }

    // Normal mode (not in contextual view)
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response based on user input
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Apply changes if any
      if (response.action) {
        response.action();
      }
    }, 1500);
  };

  const generateResponse = (userInput: string): { message: string; action?: () => void } => {
    const input = userInput.toLowerCase();

    // Reduce costs scenario
    if (input.includes('réduire') && (input.includes('coût') || input.includes('cout'))) {
      return {
        message: 'J\'ai analysé votre itinéraire. Voici une simulation pour réduire les coûts de 15% :\n\n✓ Remplacement du labour par un travail superficiel du sol (-40€)\n✓ Optimisation des passages de binage (regroupement) (-25€)\n✓ Substitution d\'engrais minéral par du digestat (-30€)\n\nRéduction totale estimée : ~250€ sur la rotation\nImpact GES : -12% d\'émissions\n\nVoulez-vous que j\'applique ces modifications au tableau ?',
        action: () => {
          setInterventions(prev =>
            prev.map(item => ({
              ...item,
              cost: (item.cost || 0) * 0.85,
              charges: item.charges * 0.85,
              ges: item.ges * 0.88
            }))
          );
        }
      };
    }

    // Organic farming scenario
    if (input.includes('bio') || input.includes('biologique')) {
      return {
        message: 'Simulation : Conversion en agriculture biologique\n\nModifications nécessaires :\n• Suppression de tous les intrants de synthèse\n• Augmentation du nombre de binages (+2 passages/an)\n• Introduction de couverts végétaux systématiques\n• Allongement de la rotation (retour du blé tous les 4 ans)\n\nImpact estimé :\n• Coûts d\'intrants : -45%\n• Temps de travail : +25%\n• Rendements : -15% (période de conversion)\n• Prime AB estimée : +180€/ha\n\nSouhaitez-vous explorer cette simulation en détail ?'
      };
    }

    // GES reduction
    if (input.includes('ges') || input.includes('carbone') || input.includes('émissions')) {
      return {
        message: 'Analyse des émissions GES de votre itinéraire actuel :\n\nPrincipales sources :\n1. Ensilage maïs : 25.5 kg CO2eq (22%)\n2. Engrais potassique : 22.5 kg CO2eq (19%)\n3. Moisson : 18.5 kg CO2eq/passage (16%)\n\nRecommandations pour réduire de 30% :\n✓ Remplacer l\'engrais minéral par digestat méthanisation\n✓ Optimiser les itinéraires pour réduire les passages\n✓ Introduire plus de légumineuses (fixation N)\n\nRéduction potentielle : -35 kg CO2eq/ha/an'
      };
    }

    // Mechanization optimization
    if (input.includes('matériel') || input.includes('location') || input.includes('achat')) {
      return {
        message: 'Analyse technico-économique du matériel :\n\n**Scénario actuel (propriété):**\n• Investissement amorti : ~850€/an\n• Entretien : 180€/an\n• Total : 1 030€/an\n\n**Scénario location:**\n• Coût location : 720€/an\n• Flexibilité : haute\n• Total : 720€/an\n\n**Scénario sous-traitance:**\n• Coût prestations : 980€/an\n• Temps de travail économisé : -15h\n\nRecommandation : La location permet une économie de 310€/an sur votre surface.'
      };
    }

    // Rotation change
    if (input.includes('rotation') || input.includes('allonger')) {
      return {
        message: 'Simulation : Allongement de la rotation\n\n**Rotation actuelle :** 5 ans\n**Rotation proposée :** 7 ans\n\nNouveau schéma :\n• Blé + féverole (an 1)\n• CIVE (an 1-2)\n• Colza + sarrasin (an 2-3)\n• Luzerne (an 3-5) - 2 ans supplémentaires\n• Maïs (an 6)\n• Orge de printemps (an 7)\n\nBénéfices attendus :\n• Structure du sol : +20%\n• Pression adventices : -35%\n• Autonomie fourragère : +40%\n• Charges phyto : -180€/ha/an'
      };
    }

    // Default response
    return {
      message: 'Je peux vous aider avec plusieurs types de simulations :\n\n📊 **Optimisation économique**\n• Comparaison location/achat/sous-traitance\n• Réduction des coûts d\'intrants\n• Calcul de marges brutes\n\n🌱 **Transition agroécologique**\n• Conversion en bio\n• Réduction des GES\n• Augmentation de la biodiversité\n\n🔄 **Reconception système**\n• Allongement de rotation\n• Changement d\'assolement\n• Introduction de nouvelles cultures\n\nPosez-moi une question spécifique sur l\'un de ces thèmes !'
    };
  };

  // Map column names to user-friendly labels
  const getColumnLabel = (columnName: string): string => {
    const labels: Record<string, string> = {
      description: 'Description',
      produit: 'Produit',
      date: 'Date',
      frequence: 'Fréquence',
      semences: 'Semences',
      engrais: 'Engrais',
      unitesMineral: 'Unités minéral (azote)',
      azoteOrganique: 'Azote organique',
      oligos: 'Rendement (TMS)',
      phytos: 'Phytos',
      ift: 'IFT',
      hri1: 'HRI1',
      mecanisation: 'Mécanisation',
      irrigation: 'Irrigation',
      workTime: 'Temps de travail',
      gnr: 'GNR',
      ges: 'GES',
      charges: 'Total charges',
      prixVente: 'Prix de vente',
      margeBrute: 'Marge brute'
    };
    return labels[columnName] || columnName;
  };

  // Generate contextual information based on focused cell
  const getContextualInfo = (columnName: string): { rule: string; sources: string[] } => {
    const contextInfo: Record<string, { rule: string; sources: string[] }> = {
      ges: {
        rule: "Le calcul des émissions GES prend en compte les facteurs d'émission des intrants (engrais, carburant), les opérations de travail du sol, et le stockage de carbone dans les sols. La formule appliquée suit les recommandations de l'ADEME et du référentiel AGRIBALYSE.",
        sources: [
          "Base AGRIBALYSE (ADEME) v3.1",
          "Guide méthodologique des bilans GES en agriculture (ADEME)"
        ]
      },
      workTime: {
        rule: "Le temps de travail est calculé en fonction du type d'intervention, de la surface traitée, et du matériel utilisé. Les barèmes de référence proviennent des données régionales de mécanisation agricole.",
        sources: [
          "Chambre d'Agriculture - Données de référence régionales",
          "Barèmes TRAME (temps de travaux)"
        ]
      },
      mecanisation: {
        rule: "Le coût de mécanisation inclut l'amortissement du matériel, l'entretien, le carburant (GNR) et la main d'œuvre. Le calcul se base sur les coûts forfaitaires régionaux actualisés.",
        sources: [
          "Chambre d'Agriculture - Coûts de référence",
          "Barème entraide (France Agricole)"
        ]
      },
      charges: {
        rule: "Les charges totales représentent la somme de tous les coûts opérationnels : semences, engrais, phytosanitaires, mécanisation, irrigation et autres intrants. Ce calcul suit la méthode comptable des charges opérationnelles.",
        sources: [
          "Réseau CER France - Référentiel comptable",
          "Chambre d'Agriculture - Coûts de référence"
        ]
      },
      ift: {
        rule: "L'IFT (Indice de Fréquence de Traitement) mesure l'intensité d'utilisation des produits phytosanitaires. Il est calculé en divisant la dose appliquée par la dose de référence du produit, puis en sommant sur l'ensemble des traitements.",
        sources: [
          "Base de données IFT - Ministère de l'Agriculture",
          "Note nationale BSV (Bulletin de Santé du Végétal)"
        ]
      },
      margeBrute: {
        rule: "La marge brute est calculée comme la différence entre les produits (prix de vente × rendement) et les charges opérationnelles spécifiques à la culture. Elle n'inclut pas les charges de structure.",
        sources: [
          "Réseau CER France - Méthode de calcul des marges",
          "Chambre d'Agriculture - Prix de référence régionaux"
        ]
      }
    };

    return contextInfo[columnName] || {
      rule: "Cette donnée est saisie manuellement ou calculée selon les paramètres définis dans les réglages de l'application.",
      sources: ["Paramètres de calcul personnalisés"]
    };
  };

  return (
    <>
      {/* Chat side panel - now relative, not fixed */}
      {isOpen && (
        <aside
          className="w-[420px] flex bg-white shadow-[0px_25px_16px_-12px_rgba(180,180,180,0.25)] border-l border-gray-200 flex-col flex-shrink-0"
          data-chatbot="true"
        >
          {/* Header */}
          <div className="bg-[#f5f5f0] h-[64px] border-b border-[#ebebeb] px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Sparkle icon from Figma design */}
              <div className="relative shrink-0 size-[20px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <g clipPath="url(#clip0_8002_1184)">
                    <path d={svgPaths.pb04d200} stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M16.6667 2.5V5.83333" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M18.3333 4.16667H15" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M3.33333 14.1667V15.8333" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M4.16667 15H2.5" stroke="#212121" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </g>
                  <defs>
                    <clipPath id="clip0_8002_1184">
                      <rect fill="white" height="20" width="20" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <h3 className="font-normal text-[16px] leading-[24px] tracking-[-0.3125px] text-[#212121]">Assistant de simulation</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-[#edf0f2] rounded size-[32px] flex items-center justify-center hover:bg-gray-300 transition-colors text-center pt-[6px] pr-[0px] pb-[0px] pl-[12px]"
              title="Replier le panneau"
            >
              <svg className="size-5" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p324d0480} stroke="#707070" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              </svg>
            </button>
          </div>

          {/* Breadcrumb - shown when a cell is focused */}
          {focusedCell && (
            <div className="bg-[#ebf7ff] border-b border-[#ebebeb] w-full">
              <div className="flex items-center px-6 py-3 gap-4">
                <button
                  className="bg-white h-[32px] w-[40px] border border-[#ebebeb] rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title="Revenir à l'assistant"
                >
                  <svg className="size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPathsBreadcrumb.p390123a0} fill="#212121" />
                  </svg>
                </button>
                <div className="flex items-center gap-1 font-['Inter'] text-[13px] leading-[20px] tracking-[-0.3008px] text-[#101828]">
                  <span className="underline decoration-solid">{focusedCell.interventionName}</span>
                  <span>{'>'}</span>
                  <span className="underline decoration-solid">{getColumnLabel(focusedCell.columnName)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 bg-[#f5f5f0]">
            {focusedCell ? (
              /* Contextual view - show contextual messages */
              <div className="space-y-4">
                {/* Show calculation rules at the top */}
                <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[18px]">
                  <div className="font-['Inter'] text-[14px] leading-[20px] tracking-[-0.3008px] text-[#101828]">
                    <p className="mb-4">
                      Voici la règle de calcul qui m'a permis d'arriver à ce chiffre: {getContextualInfo(focusedCell.columnName).rule}
                    </p>
                    <p className="mb-2">Voici les sources qui ont été utilisées :</p>
                    <ul className="list-disc ml-5">
                      {getContextualInfo(focusedCell.columnName).sources.map((source, index) => (
                        <li key={index} className="mb-1">{source}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="font-['Inter'] text-[12px] leading-[16px] text-[#6a7282] mt-4">
                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Show contextual messages for this cell below */}
                {contextualMessages.map(message => (
                  <div key={message.id}>
                    {message.role === 'assistant' ? (
                      <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[17px_17px_13px]">
                        <p className="font-normal text-[14px] leading-[20px] tracking-[-0.1504px] text-[#101828] whitespace-pre-line">
                          {message.content}
                        </p>
                        <p className="font-normal text-[12px] leading-[16px] text-[#6a7282] mt-1">
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-[#6b9571] rounded-[10px] shadow-sm px-4 py-3 max-w-[80%]">
                          <p className="font-normal text-[14px] leading-[20px] text-white whitespace-pre-line">
                            {message.content}
                          </p>
                          <p className="font-normal text-[12px] leading-[16px] text-green-100 mt-1">
                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Show typing indicator in contextual view */}
                {isTyping && (
                  <div className="bg-white rounded-[10px] border border-gray-200 shadow-sm px-4 py-3 inline-block">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Normal messages view */
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id}>
                    {message.role === 'assistant' ? (
                      <div className="bg-white rounded-[10px] border border-gray-200 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-[17px_17px_13px]">
                        <p className="font-normal text-[14px] leading-[20px] tracking-[-0.1504px] text-[#101828] whitespace-pre-line">
                          {message.content}
                        </p>
                        <p className="font-normal text-[12px] leading-[16px] text-[#6a7282] mt-1">
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-[#6b9571] rounded-[10px] shadow-sm px-4 py-3 max-w-[80%]">
                          <p className="font-normal text-[14px] leading-[20px] text-white whitespace-pre-line">
                            {message.content}
                          </p>
                          <p className="font-normal text-[12px] leading-[16px] text-green-100 mt-1">
                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="bg-white rounded-[10px] border border-gray-200 shadow-sm px-4 py-3 inline-block">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#6b9571] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-6 pt-[25px] pb-6">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Demandez une simulation..."
                className="flex-1 px-4 py-2 h-[38px] border border-[#d1d5dc] rounded-[10px] text-[14px] tracking-[-0.1504px] text-[rgba(10,10,10,0.5)] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#6b9571]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-[#6b9571] text-white rounded-[10px] w-[48px] h-[38px] flex items-center justify-center hover:bg-[#5a8560] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.p185227c0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d={svgPaths.p2db0e900} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInput('Comment réduire les coûts de 15% ?')}
                className="text-[12px] font-medium leading-[16px] bg-white hover:bg-gray-50 border border-gray-200 px-3 h-[30px] rounded transition-colors text-neutral-950"
              >
                Réduire les coûts
              </button>
              <button
                onClick={() => setInput('Simulation passage en bio')}
                className="text-[12px] font-medium leading-[16px] bg-white hover:bg-gray-50 border border-gray-200 px-3 h-[30px] rounded transition-colors text-neutral-950"
              >
                Conversion bio
              </button>
              <button
                onClick={() => setInput('Comment réduire les émissions GES ?')}
                className="text-[12px] font-medium leading-[16px] bg-white hover:bg-gray-50 border border-gray-200 px-3 h-[30px] rounded transition-colors text-neutral-950"
              >
                Réduire GES
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}