import svgPaths from "./svg-abbk4gof4j";

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_8002_1184)" id="Icon">
          <path d={svgPaths.pb04d200} id="Vector" stroke="var(--stroke-0, #212121)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M16.6667 2.5V5.83333" id="Vector_2" stroke="var(--stroke-0, #212121)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M18.3333 4.16667H15" id="Vector_3" stroke="var(--stroke-0, #212121)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M3.33333 14.1667V15.8333" id="Vector_4" stroke="var(--stroke-0, #212121)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M4.16667 15H2.5" id="Vector_5" stroke="var(--stroke-0, #212121)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_8002_1184">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#212121] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Assistant de simulation</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[24px] relative shrink-0 w-[195.055px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] h-[24px] items-center relative w-[195.055px]">
        <Icon />
        <Heading />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%_-16.67%]" style={{ "--stroke-0": "rgba(112, 112, 112, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 12">
            <path d={svgPaths.p324d0480} id="Vector" stroke="var(--stroke-0, #707070)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#edf0f2] relative rounded-[4px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[6px] px-[6px] relative size-[32px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#f5f5f0] h-[64px] relative shrink-0 w-[419px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[64px] items-center justify-between pb-px pt-0 px-[24px] relative w-[419px]">
        <Container />
        <Button />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[240px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[261px]">
        <p className="mb-0">{`Bonjour ! Je suis votre assistant de simulation d'itinéraires techniques. Vous pouvez me demander de :`}</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">• Modifier les coûts ou temps de travail</p>
        <p className="mb-0">• Ajouter ou supprimer des interventions</p>
        <p className="mb-0">• Comparer différentes stratégies (location vs achat)</p>
        <p className="mb-0">• Simuler un changement de rotation</p>
        <p className="mb-0">{`• Évaluer l'impact environnemental`}</p>
        <p className="mb-0">&nbsp;</p>
        <p>Comment puis-je vous aider ?</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">17:25</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-white h-[286px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[4px] h-[286px] items-start pb-px pt-[13px] px-[17px] relative w-full">
          <Container2 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 bg-[#f5f5f0] grow min-h-px min-w-px relative shrink-0 w-[419px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col h-full items-start overflow-clip pb-0 pl-[24px] pr-[98.203px] pt-[24px] relative rounded-[inherit] w-[419px]">
        <Container4 />
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="basis-0 grow h-[38px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[38px] items-center px-[16px] py-[8px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(10,10,10,0.5)] text-nowrap tracking-[-0.1504px] whitespace-pre">Demandez une simulation...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path d={svgPaths.p185227c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.95%_8.94%_45.48%_45.47%]" data-name="Vector">
        <div className="absolute inset-[-9.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
            <path d={svgPaths.p2db0e900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#6b9571] h-[38px] opacity-50 relative rounded-[10px] shrink-0 w-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col h-[38px] items-start pb-0 pt-[11px] px-[16px] relative w-[48px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[38px] items-start relative shrink-0 w-full" data-name="Container">
      <TextInput />
      <Button1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white border border-gray-200 border-solid h-[30px] left-0 rounded-[4px] top-0 w-[116.094px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[57.5px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[7px] translate-x-[-50%] whitespace-pre">Réduire les coûts</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-white border border-gray-200 border-solid h-[30px] left-[124.09px] rounded-[4px] top-0 w-[104.813px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[51px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[7px] translate-x-[-50%] whitespace-pre">Conversion bio</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-white border border-gray-200 border-solid h-[30px] left-[236.91px] rounded-[4px] top-0 w-[91.82px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[45.5px] not-italic text-[12px] text-center text-neutral-950 text-nowrap top-[7px] translate-x-[-50%] whitespace-pre">Réduire GES</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-white h-[129px] relative shrink-0 w-[419px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] h-[129px] items-start pb-0 pt-[25px] px-[24px] relative w-[419px]">
        <Container6 />
        <Container7 />
      </div>
    </div>
  );
}

export default function ChatBot() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pl-px pr-0 py-0 relative size-full" data-name="ChatBot">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none shadow-[0px_25px_16px_-12px_rgba(180,180,180,0.25)]" />
      <Container1 />
      <Container5 />
      <Container8 />
    </div>
  );
}